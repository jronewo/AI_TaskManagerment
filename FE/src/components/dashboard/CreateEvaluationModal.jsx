import { useState } from 'react'
import { createEvaluation } from '../../api/evaluations'

export default function CreateEvaluationModal({ targetUserId, targetUserName, projectId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    feedback: ''
  })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await createEvaluation({
        userId: targetUserId,
        projectId: projectId, // Can be null if team-wide, but usually project specific
        rating: formData.rating,
        feedback: formData.feedback
      })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⭐</span> Đánh giá thành viên
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Thành viên</label>
            <div className="w-full rounded-lg bg-slate-800/50 p-3 text-white border border-white/5 font-medium">
              {targetUserName}
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm text-slate-400 mb-2">
              <span>Điểm đánh giá (1-10)</span>
              <span className="font-bold text-cyan-400">{formData.rating}</span>
            </label>
            <input 
              type="range" min="1" max="10" step="1"
              value={formData.rating} 
              onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
              className="w-full accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 uppercase font-bold">
              <span>Rất tệ</span>
              <span>Xuất sắc</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Nhận xét chi tiết</label>
            <textarea 
              required
              rows={4}
              placeholder="Ghi nhận điểm mạnh, điểm yếu, và đề xuất cải thiện..."
              value={formData.feedback} 
              onChange={e => setFormData({...formData, feedback: e.target.value})}
              className="w-full rounded-xl bg-slate-950/50 p-3 text-sm text-white border border-white/10 focus:border-cyan-500 focus:outline-none transition-colors" 
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
             <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5">
                Hủy
             </button>
             <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-cyan-600 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-900/20">
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
