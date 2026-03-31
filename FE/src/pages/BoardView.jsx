import { useCallback, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { TaskGenieLogo } from '../components/TaskGenieLogo'
import { clearSession, getRole, getUserId } from '../lib/authStorage'

import { getProjectById } from '../api/projects'
import { getTasksByProject, createTask, updateTask, updateTaskProgress, addDependency, removeDependency, suggestEstimatedTime } from '../api/tasks'
import { analyzeProjectRisk, acceptAiRecommendation } from '../api/ai'
import { getTeamById } from '../api/teams'

import TaskCard from '../components/board/TaskCard'
import CreateTaskModal from '../components/board/CreateTaskModal'
import TaskDetailModal from '../components/board/TaskDetailModal'
import DependencyGraphModal from '../components/board/DependencyGraphModal'
import AiWorkloadModal from '../components/board/AiWorkloadModal'

const COLS = [
  { id: 'Todo', title: 'To Do', bar: 'from-cyan-500 to-teal-600' },
  { id: 'In Progress', title: 'In Progress', bar: 'from-amber-500 to-rose-500' },
  { id: 'Review', title: 'Review', bar: 'from-purple-500 to-fuchsia-600' },
  { id: 'Done', title: 'Done', bar: 'from-emerald-500 to-cyan-600' },
]

export default function BoardView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(() => ({
    userId: getUserId(),
    role: getRole(),
  }))
  const loggedIn = Boolean(session.userId)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState({ 'Todo': [], 'In Progress': [], 'Review': [], 'Done': [] })
  const [isLeader, setIsLeader] = useState(false)
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGraphModal, setShowGraphModal] = useState(false)
  const [showAiWorkloadModal, setShowAiWorkloadModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])

  // Member Evaluation Modal
  const [showEvalMemberModal, setShowEvalMemberModal] = useState(false)
  const [evalMemberState, setEvalMemberState] = useState({ memberId: null, score: 100, feedback: '', loading: false })

  // AI Risk State
  const [riskReport, setRiskReport] = useState(null)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isScanningRisk, setIsScanningRisk] = useState(false)

  // DND Fix
  const [isDndReady, setIsDndReady] = useState(false)
  useEffect(() => {
    setIsDndReady(true)
  }, [])

  const fetchBoardData = useCallback(async () => {
    try {
      setLoading(true)
      const proj = await getProjectById(projectId)
      setProject(proj)
      
      const userId = getUserId()

      let leaderStatus = false;
      if (session.role === 'Admin') {
        leaderStatus = true;
      }

      if (proj.teamId) {
        try {
          const team = await getTeamById(proj.teamId)
          if (team && team.members) {
            setTeamMembers(team.members)
            if (team.createdBy === userId) {
              leaderStatus = true;
            }
          }
        } catch (e) {
          console.error("Lỗi lấy thành viên team:", e)
        }
      }
      setIsLeader(leaderStatus)

      const tasksData = await getTasksByProject(projectId)
      
      // Group tasks by status
      const grouped = { 'Todo': [], 'In Progress': [], 'Review': [], 'Done': [] }
      tasksData.forEach(t => {
        const s = grouped[t.status] ? t.status : 'Todo'
        grouped[s].push(t)
      })
      setTasks(grouped)

      // if selectedTask is open, update its reference
      if (selectedTask) {
        const updatedTask = tasksData.find(t => t.taskId === selectedTask.taskId)
        if (updatedTask) setSelectedTask(updatedTask)
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [projectId, selectedTask])

  useEffect(() => {
    fetchBoardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // reload on mount

  useEffect(() => {
    if (isLeader && projectId) {
      const scanKey = `scanned_risk_${projectId}_${session.userId}`
      if (!sessionStorage.getItem(scanKey)) {
        setIsScanningRisk(true)
        analyzeProjectRisk(projectId)
          .then(res => {
            setRiskReport(res)
            setShowRiskModal(true)
            sessionStorage.setItem(scanKey, 'true')
          })
          .catch(err => console.error(err))
          .finally(() => setIsScanningRisk(false))
      }
    }
  }, [isLeader, projectId, session.userId])

  function logout() {
    clearSession()
    setSession({ userId: null, role: null })
    navigate('/login')
  }

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newStatus = destination.droppableId
    const taskIdString = draggableId.replace('task-', '')
    const taskId = parseInt(taskIdString, 10)

    // Optimistic UI update
    setTasks((prev) => {
      const sourceList = [...prev[source.droppableId]]
      const destList = source.droppableId === destination.droppableId ? sourceList : [...prev[destination.droppableId]]
      const [movedItem] = sourceList.splice(source.index, 1)
      movedItem.status = newStatus
      destList.splice(destination.index, 0, movedItem)

      if (source.droppableId === destination.droppableId) {
        return { ...prev, [source.droppableId]: sourceList }
      } else {
        return { ...prev, [source.droppableId]: sourceList, [destination.droppableId]: destList }
      }
    })

    // API Call
    try {
      await updateTaskProgress(taskId, { status: newStatus })
      fetchBoardData() // refresh to get consistent risk/progress states if backend auto-updates them
    } catch (error) {
      alert(error.message)
      fetchBoardData() // revert
    }
  }

  // --- Handlers for Modals ---
  const handleCreateTask = async (taskData) => {
    const created = await createTask(taskData)
    fetchBoardData()
    return created
  }

  const handleUpdateDetails = async (taskId, data) => {
    await updateTask(taskId, data)
    fetchBoardData()
  }

  const handleUpdateProgress = async (taskId, progressData) => {
    await updateTaskProgress(taskId, progressData)
    fetchBoardData()
  }

  const handleQuickAssign = async (taskId, userId) => {
    try {
      await acceptAiRecommendation(taskId, userId)
      alert("Đã gán task và gửi thông báo cho user!")
      fetchBoardData()
    } catch (e) {
      alert(e.message)
    }
  }

  const handleSuggestTime = async (taskId) => {
    await suggestEstimatedTime(taskId)
    alert("AI đã tính toán xong và thay đổi Thời gian dự kiến (AI Estimated Time)!")
    fetchBoardData()
  }

  const submitEvalMember = async (e) => {
    e.preventDefault()
    if (!evalMemberState.memberId) return alert('Vui lòng chọn thành viên!')
    setEvalMemberState(p => ({ ...p, loading: true }))
    try {
      const { apiUrl, safeFetch, parseBody } = await import('../api/client')
      const res = await safeFetch(apiUrl(`api/Evaluations`), {
        method: 'POST',
        body: JSON.stringify({
          userId: evalMemberState.memberId,
          leaderId: session.userId,
          skillScore: parseInt(evalMemberState.score),
          teamworkScore: parseInt(evalMemberState.score),
          deadlineScore: parseInt(evalMemberState.score),
          communicationScore: parseInt(evalMemberState.score)
        })
      })
      if (res.ok) {
        alert('Đã gửi đánh giá thành viên thành công!')
        setEvalMemberState({ memberId: null, score: 100, feedback: '', loading: false })
      } else {
        const text = await parseBody(res)
        alert('Lỗi: ' + (text?.message || JSON.stringify(text)))
        setEvalMemberState(p => ({ ...p, loading: false }))
      }
    } catch (err) {
      alert(err.message)
      setEvalMemberState(p => ({ ...p, loading: false }))
    }
  }

  const handleAddDependency = async (taskId, depId) => {
    await addDependency(taskId, depId)
    fetchBoardData()
  }

  const handleRemoveDependency = async (taskId, depId) => {
    await removeDependency(taskId, depId)
    fetchBoardData()
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#070a12] text-slate-300">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.1),transparent)]" aria-hidden />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-slate-950/50 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-cyan-300">
             <span className="text-xl">←</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-300">
            <TaskGenieLogo variant="aurora" className="[&_svg]:h-7 [&_svg]:w-7 [&_span]:text-base" />
          </Link>
          <h1 className="text-sm font-bold text-white border-l border-white/10 pl-4">{project?.name || 'Loading...'}</h1>
        </div>

        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              <span className="hidden text-xs text-slate-500 sm:inline">{session.role}</span>
              <button type="button" onClick={logout} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5">
                Đăng xuất
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded-full px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-white/5">Đăng nhập</Link>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 h-[calc(100vh-64px)] flex flex-col">
        {loading && !project ? (
          <div className="flex items-center justify-center p-20 text-slate-500">Đang tải bảng...</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div>
                <h1 className="text-xl font-bold text-white uppercase">{project.name}</h1>
                <p className="text-sm text-slate-500">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowGraphModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 shadow-lg"
                >
                  🕸️ Sơ đồ phụ thuộc
                </button>
                {isLeader && (
                  <>
                    <button 
                      onClick={() => setShowAiWorkloadModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 px-4 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-600/40 shadow-lg shadow-violet-900/20"
                    >
                      🤖 AI Tư vấn
                    </button>
                    <button 
                      onClick={() => setShowEvalMemberModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-amber-600/20 border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-600/40 shadow-lg shadow-amber-900/20"
                    >
                      ⭐ Đánh giá
                    </button>
                    <button 
                      onClick={async () => {
                        try {
                          setIsScanningRisk(true)
                          const res = await analyzeProjectRisk(projectId)
                          setRiskReport(res)
                          setShowRiskModal(true)
                        } catch (err) {
                          alert('Lỗi quét rủi ro: ' + err.message)
                        } finally {
                          setIsScanningRisk(false)
                        }
                      }}
                      disabled={isScanningRisk}
                      className="flex items-center gap-2 rounded-xl bg-rose-600/20 border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-600/40 shadow-lg shadow-rose-900/20 disabled:opacity-50"
                    >
                      {isScanningRisk ? '🔄 Đang quét...' : '⚡ Dự đoán Rủi ro'}
                    </button>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 shadow-lg shadow-cyan-900/20"
                    >
                      + Tạo Task
                    </button>
                  </>
                )}
              </div>
            </div>

            {isDndReady && (
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid gap-5 md:grid-cols-4 flex-1 h-full min-h-0">
                {COLS.map((col) => (
                  <section key={col.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/50 shadow-xl backdrop-blur-sm">
                    <div className={`h-1 shrink-0 bg-gradient-to-r ${col.bar}`} />
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 shrink-0">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">{col.title}</h2>
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold text-cyan-300">{tasks[col.id]?.length || 0}</span>
                    </div>
                    
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div 
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`flex flex-col gap-3 overflow-y-auto p-3 flex-1 transition-colors ${snapshot.isDraggingOver ? 'bg-white/[0.02]' : ''}`}
                        >
                          {tasks[col.id]?.map((task, index) => (
                                <Draggable key={String(task.taskId)} draggableId={`task-${task.taskId}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => setSelectedTask(task)}
                                      className={`${snapshot.isDragging ? 'rotate-2 scale-105 opacity-90 shadow-2xl z-50' : 'z-0 shadow-sm'} transition-transform duration-200 ease-out`}
                                      style={{ ...provided.draggableProps.style }}
                                    >
                                      <TaskCard 
                                        task={task} 
                                        onClick={() => setSelectedTask(task)} 
                                        members={teamMembers}
                                        onAssign={handleQuickAssign}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </section>
                ))}
                </div>
              </DragDropContext>
            )}
          </>
        )}
      </main>

      {/* AI Risk Scanning Overlay indicator */}
      {isScanningRisk && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-xl flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
          <span className="text-sm text-cyan-400 font-medium">AI đang quét rủi ro dự án...</span>
        </div>
      )}

      {/* Risk Alert Modal */}
      {showRiskModal && riskReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" aria-hidden="true" />
          <div className="relative w-full max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl shadow-rose-900/20 overflow-hidden text-center animate-in fade-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 mb-4 ring-4 ring-rose-500/10">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Báo Cáo Rủi Ro Dự Án (AI)</h2>
            <p className="text-slate-400 text-sm mb-6">
              Hệ thống vừa tự động quét <strong className="text-white">{riskReport.totalActive}</strong> task chưa hoàn thành.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Rủi ro cao</p>
                <p className="text-2xl font-black text-rose-500">{riskReport.highRisk}</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cảnh báo</p>
                <p className="text-2xl font-black text-amber-500">{riskReport.mediumRisk}</p>
              </div>
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">An toàn</p>
                <p className="text-2xl font-black text-emerald-500">{riskReport.lowRisk}</p>
              </div>
            </div>

            {riskReport.warnings && riskReport.warnings.length > 0 && (
              <div className="text-left bg-rose-950/30 rounded-lg p-3 border border-rose-900/50 mb-6 max-h-32 overflow-y-auto">
                <ul className="list-disc pl-5 text-sm text-rose-300 space-y-1">
                  {riskReport.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowRiskModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 py-3 font-bold text-white shadow-lg hover:from-rose-500 hover:to-orange-500 transition-all border border-rose-400"
            >
              Đã hiểu, đóng cảnh báo
            </button>
          </div>
        </div>
      )}
      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal 
          projectId={projectId} 
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={Object.values(tasks).flat()}
          isLeader={isLeader}
          onClose={() => setSelectedTask(null)}
          onSuggestTime={handleSuggestTime}
          onUpdateProgress={handleUpdateProgress}
          onUpdateDetails={handleUpdateDetails}
          onAddDependency={handleAddDependency}
          onRemoveDependency={handleRemoveDependency}
        />
      )}

      {showGraphModal && (
        <DependencyGraphModal
          projectId={projectId}
          onClose={() => setShowGraphModal(false)}
        />
      )}

      {showAiWorkloadModal && (
        <AiWorkloadModal 
          projectId={projectId}
          onClose={() => setShowAiWorkloadModal(false)}
        />
      )}

      {/* Member Evaluation Modal */}
      {showEvalMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setShowEvalMemberModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-white mb-1">Đánh Giá Thành Viên</h3>
            <p className="text-xs text-slate-400 mb-6">Đánh giá các thành viên tham gia dự án.</p>
            <form onSubmit={submitEvalMember} className="space-y-4 text-sm mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Chọn Thành Viên</label>
                <select 
                  value={evalMemberState.memberId || ''} 
                  onChange={e => setEvalMemberState(p => ({ ...p, memberId: e.target.value }))}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required
                >
                  <option value="" disabled>--- Chọn User ---</option>
                  {teamMembers.map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name || m.user?.email || `User #${m.userId}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Điểm số (0-100)</label>
                <input type="number" min="0" max="100" value={evalMemberState.score} onChange={e => setEvalMemberState(p => ({ ...p, score: e.target.value }))} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required />
              </div>
              <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                <button type="submit" disabled={evalMemberState.loading} className="w-full py-3 bg-amber-600 rounded-xl font-bold text-white hover:bg-amber-500 transition-colors disabled:opacity-50 uppercase tracking-widest text-xs">
                  GỬI ĐÁNH GIÁ (LƯU DB)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
