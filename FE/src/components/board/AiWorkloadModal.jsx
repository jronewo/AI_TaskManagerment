import { useState, useEffect } from 'react'
import { getProjectWorkloadSuggestion } from '../../api/ai'

export default function AiWorkloadModal({ projectId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchWorkload() {
      try {
        const suggestion = await getProjectWorkloadSuggestion(projectId)
        setData(suggestion)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkload()
  }, [projectId])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🤖</span> Tư vấn phân bổ khối lượng đội nhóm
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
               <div className="h-8 w-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
               <p className="text-sm text-cyan-400 font-medium">Khởi tạo mô hình AI và phân tích kỹ năng Team...</p>
             </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              Lỗi: {error}
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed">
                {data?.suggestions?.[0]?.reason || "Chưa có đề xuất chi tiết."}
              </div>
              
              <div className="bg-cyan-500/5 rounded-xl border border-cyan-500/20 p-4 mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Đề xuất tối ưu</h4>
                <p className="text-sm text-slate-300">
                  Phân tích tổng hợp dựa trên năng lực của Team và độ ưu tiên Task.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
