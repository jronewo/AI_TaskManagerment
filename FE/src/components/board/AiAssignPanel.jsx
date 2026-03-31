import { useState } from 'react'
import { getAiRecommendations, acceptAiRecommendation, getAssignmentReason } from '../../api/ai'

export default function AiAssignPanel({ task, projectId, onAssigned }) {
  const [loading, setLoading] = useState(false)
  const [loadingReasonMap, setLoadingReasonMap] = useState({})
  const [deepReasons, setDeepReasons] = useState({})
  const [recommendations, setRecommendations] = useState(null)
  const taskId = task.taskId
  
  const handleGetRecommendations = async () => {
    try {
      setLoading(true)
      const data = await getAiRecommendations(task.taskId, projectId)
      if (data && data.suggestions) {
        setRecommendations(data.suggestions)
      } else {
        setRecommendations([])
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (userId) => {
    try {
      await acceptAiRecommendation(taskId, userId)
      alert("Đã phân công thành công!")
      if (onAssigned) onAssigned()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeepExplain = async (userId, userProfileString) => {
    try {
      setLoadingReasonMap(prev => ({ ...prev, [userId]: true }))
      const res = await getAssignmentReason(task.description || task.title, userProfileString)
      setDeepReasons(prev => ({ ...prev, [userId]: res.reason }))
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingReasonMap(prev => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-900/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center gap-2 text-sm font-bold text-violet-300">
          <span>✨</span> Gợi ý phân công bằng AI
        </h4>
        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-600/40 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Đang phân tích...' : recommendations ? 'Làm mới' : 'Bắt đầu phân tích'}
        </button>
      </div>

      {recommendations && (
        <div className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={rec.userId} className="flex flex-col gap-2 rounded-lg border border-white/[0.05] bg-slate-900/50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">{rec.userName}</span>
                    <span className="ml-2 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-400">
                      Score: {rec.score.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleAccept(rec.userId)}
                    className="rounded bg-emerald-600/20 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-600/40"
                  >
                    Giao việc
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  <p>Lý do cơ bản: {rec.reason}</p>
                  
                  {deepReasons[rec.userId] ? (
                    <div className="mt-2 p-2 rounded bg-cyan-900/20 border border-cyan-500/20 text-cyan-300">
                      <strong className="text-cyan-400">🤖 Giải thích chi tiết: </strong>
                      {deepReasons[rec.userId]}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleDeepExplain(rec.userId, JSON.stringify(rec))}
                      disabled={loadingReasonMap[rec.userId]}
                      className="mt-2 text-[10px] uppercase font-bold text-violet-400 hover:text-violet-300"
                    >
                      {loadingReasonMap[rec.userId] ? 'Đang phân tích...' : 'Hỏi AI giải thích sâu hơn'}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Không tìm thấy ai phù hợp.</p>
          )}
        </div>
      )}
    </div>
  )
}
