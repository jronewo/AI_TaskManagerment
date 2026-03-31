import { useState, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { getDependencyGraph } from '../../api/tasks'

// Status color config
const statusConfig = {
  'Todo': { bg: 'bg-amber-950', border: 'border-amber-500', text: 'text-amber-200', dot: '#f59e0b' },
  'In Progress': { bg: 'bg-blue-950', border: 'border-blue-500', text: 'text-blue-200', dot: '#3b82f6' },
  'Review': { bg: 'bg-purple-950', border: 'border-purple-500', text: 'text-purple-200', dot: '#a855f7' },
  'Done': { bg: 'bg-emerald-950', border: 'border-emerald-500', text: 'text-emerald-200', dot: '#10b981' },
}

const TaskNode = ({ data }) => {
  const cfg = statusConfig[data.status] || statusConfig['Todo']
  return (
    <div className={`px-4 py-3 rounded-xl shadow-lg border-2 ${cfg.border} ${cfg.bg} ${cfg.text} min-w-[160px]`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
        <span className="font-bold text-xs">#{data.id}</span>
      </div>
      <div className="font-semibold text-sm truncate">{data.label}</div>
      <div className="flex items-center justify-between mt-2 text-[10px] opacity-80">
        <span>{data.status}</span>
        {data.progress != null && <span>{data.progress}%</span>}
      </div>
      {data.priority && (
        <div className={`mt-1 text-[9px] font-bold ${
          data.priority === 'High' ? 'text-rose-400' : data.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          ● {data.priority}
        </div>
      )}
    </div>
  )
}

const nodeTypes = { task: TaskNode }

// Simple layered layout algorithm (dagre-like)
function computeLayeredLayout(nodes, edges) {
  if (nodes.length === 0) return []

  // Build adjacency
  const inDegree = {}
  const adj = {}
  nodes.forEach(n => { inDegree[n.id] = 0; adj[n.id] = [] })
  edges.forEach(e => {
    if (inDegree[e.target] !== undefined) inDegree[e.target]++
    if (adj[e.source]) adj[e.source].push(e.target)
  })

  // Topological sort → assign layers
  const layers = {}
  const queue = Object.keys(inDegree).filter(k => inDegree[k] === 0)
  const visited = new Set()
  
  queue.forEach(k => { layers[k] = 0 })
  
  while (queue.length > 0) {
    const node = queue.shift()
    if (visited.has(node)) continue
    visited.add(node)
    
    const children = adj[node] || []
    children.forEach(child => {
      layers[child] = Math.max(layers[child] || 0, (layers[node] || 0) + 1)
      inDegree[child]--
      if (inDegree[child] <= 0) queue.push(child)
    })
  }
  
  // Assign remaining unvisited nodes
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      layers[n.id] = 0
      visited.add(n.id)
    }
  })

  // Group by layer
  const layerGroups = {}
  Object.entries(layers).forEach(([id, layer]) => {
    if (!layerGroups[layer]) layerGroups[layer] = []
    layerGroups[layer].push(id)
  })

  // Position nodes
  const xGap = 280
  const yGap = 120
  const positioned = {}
  
  Object.entries(layerGroups).forEach(([layer, ids]) => {
    const layerNum = parseInt(layer)
    const totalHeight = (ids.length - 1) * yGap
    const startY = -totalHeight / 2
    
    ids.forEach((id, i) => {
      // Cast id to Number to match data.nodes if it was grouped by string keys in layers
      const numId = Number(id)
      positioned[numId] = {
        x: layerNum * xGap,
        y: startY + i * yGap
      }
    })
  })

  return positioned
}

export default function DependencyGraphModal({ projectId, onClose }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setLoading(true)
        const data = await getDependencyGraph(projectId)
        
        // Compute layered positions
        const positions = computeLayeredLayout(data.nodes, data.edges)
        
        const initialNodes = data.nodes.map((n) => ({
          id: String(n.id),
          type: 'task',
          position: positions[n.id] || { x: 0, y: 0 },
          data: { 
            id: String(n.id), 
            label: n.title, 
            status: n.status,
            priority: n.priority,
            progress: n.progress
          }
        }))

        const initialEdges = data.edges.map(e => ({
          id: String(e.id),
          source: String(e.source),
          target: String(e.target),
          animated: true,
          style: { stroke: '#06b6d4', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#06b6d4',
          },
          label: 'depends on',
          labelStyle: { fontSize: 9, fill: '#64748b' },
          labelBgStyle: { fill: '#0f172a', opacity: 0.8 },
        }))

        setNodes(initialNodes)
        setEdges(initialEdges)
      } catch (error) {
        console.error("Lỗi lấy data graph:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGraph()
  }, [projectId, setNodes, setEdges])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-[90vw] flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">🕸️ Sơ đồ Phụ thuộc</h2>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[10px] ml-4">
              {Object.entries(statusConfig).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  <span className="text-slate-400">{status}</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 w-full bg-slate-950">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-400">Đang tải biểu đồ...</div>
          ) : nodes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-4 opacity-30">🕸️</span>
              <p>Dự án chưa có dependency nào.</p>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              className="touch-none"
            >
              <Background color="#1e293b" gap={16} />
              <Controls className="bg-slate-800 text-cyan-400 fill-cyan-400 border-white/10" />
              <MiniMap nodeStrokeColor="#06b6d4" nodeColor="#0f172a" maskColor="rgba(0, 0, 0, 0.4)" />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  )
}
