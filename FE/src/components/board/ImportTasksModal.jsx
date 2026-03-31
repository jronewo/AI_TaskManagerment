import { useState } from 'react'

import { apiUrl } from '../../api/client'

export default function ImportTasksModal({ isOpen, onClose, onImport, projectId }) {
  const [csvContent, setCsvContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setCsvContent(event.target.result)
    reader.readAsText(file)
  }

  const handleDownloadTemplate = () => {
    window.location.href = apiUrl('api/Tasks/template-csv')
  }

  const processImport = async () => {
    if (!csvContent.trim()) {
      alert("Nội dung rỗng")
      return
    }
    
    setIsProcessing(true)
    try {
      const lines = csvContent.split('\n').filter(line => line.trim().length > 0)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const tasksToCreate = []
      
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV parse handling no quotes
        const cols = lines[i].split(',').map(c => c.trim())
        if (cols.length < Math.min(headers.length, 1)) continue
        
        const taskData = {
          projectId: Number(projectId),
          title: cols[0] || 'Untitled Task',
          description: cols[1] || '',
          priority: cols[2] && ['Low', 'Medium', 'High', 'Critical'].includes(cols[2]) ? cols[2] : 'Medium',
          status: 'Todo',
          estimatedTime: cols[3] && !isNaN(cols[3]) ? Number(cols[3]) : null,
          deadline: cols[4] || null // Let server map string if acceptable, else simple ISO date.
        }
        
        tasksToCreate.push(taskData)
      }
      
      await onImport(tasksToCreate)
      onClose()
    } catch (e) {
      alert("Lỗi khi import: " + e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-slate-950/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Import Tasks từ CSV
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10">✕</button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div>
            <p className="text-sm text-slate-300 mb-2">1. Tải file mẫu CSV hoặc tự tạo file với cấu trúc tương tự (5 cột).</p>
            <button 
              onClick={handleDownloadTemplate}
              className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition"
            >
              ⬇️ Tải file mẫu (Template.csv)
            </button>
          </div>

          <div>
            <p className="text-sm text-slate-300 mb-2">2. Upload file CSV hoặc dán nội dung CSV vào ô dưới đây.</p>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400
                hover:file:bg-cyan-500/20 mb-3"
            />
            
            <textarea
              className="w-full h-40 rounded-xl bg-slate-950 border border-white/10 p-3 text-sm text-slate-300 font-mono outline-none focus:border-cyan-500/50"
              placeholder="Title,Description,Priority,EstimatedTime,Deadline&#10;Task mới,Giao diện đăng nhập,High,5,2024-05-20"
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/30 p-5 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 transition"
          >
            Hủy
          </button>
          <button 
            onClick={processImport}
            disabled={isProcessing || !csvContent.trim()}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:brightness-110 disabled:opacity-50 transition shadow-lg"
          >
            {isProcessing ? 'Đang Import...' : 'Bắt đầu Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
