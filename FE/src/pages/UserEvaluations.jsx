import { useState, useEffect } from 'react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { apiUrl, safeFetch, parseBody } from '../api/client'
import { getUserId } from '../lib/authStorage'

export default function UserEvaluations() {
  const [evaluations, setEvaluations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const userId = getUserId()

  useEffect(() => {
    async function fetchEvaluations() {
      if (!userId) return
      try {
        setIsLoading(true)
        const res = await safeFetch(apiUrl(`api/Evaluations/user/${userId}`))
        const data = await parseBody(res)
        if (Array.isArray(data)) {
          setEvaluations(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEvaluations()
  }, [userId])

  const calculateAverage = (e) => {
    const scores = [e.skillScore, e.teamworkScore, e.deadlineScore, e.communicationScore].filter(s => s != null)
    if (scores.length === 0) return 0
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Đánh giá Năng lực ⭐/5</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Theo dõi quá trình phát triển và nhận xét từ các Leader dự án. 
            Điểm số này giúp hệ thống AI đề xuất bạn vào các dự án quan trọng hơn.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400 font-bold">
            ⚠️ Lỗi: {error}
          </div>
        )}

        <div className="space-y-6">
          {evaluations.map((e) => (
            <div key={e.evaluationId} className="relative group overflow-hidden bg-slate-900/40 border border-white/5 rounded-[32px] p-6 lg:p-8 hover:border-cyan-500/20 transition-all">
              <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-100 transition-opacity opacity-50"></div>
              
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center relative z-10">
                <div className="text-center p-6 bg-slate-950/50 rounded-3xl border border-white/5 shadow-2xl">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 italic">Tổng điểm</div>
                   <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500">{calculateAverage(e)}</div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                   <ScoreCard label="Kỹ năng" score={e.skillScore} color="cyan" />
                   <ScoreCard label="Teamwork" score={e.teamworkScore} color="purple" />
                   <ScoreCard label="Deadline" score={e.deadlineScore} color="rose" />
                   <ScoreCard label="Giao tiếp" score={e.communicationScore} color="amber" />
                </div>

                <div className="lg:border-l border-white/5 lg:pl-8 text-right min-w-[150px]">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Người đánh giá</div>
                   <div className="text-sm font-bold text-white uppercase">{e.leaderName || 'Project Leader'}</div>
                   <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">{new Date(e.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}

          {evaluations.length === 0 && (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-slate-900/20">
               <div className="text-4xl mb-4 opacity-20">📊</div>
               <h3 className="text-slate-400 font-bold italic">Chưa có đánh giá nào từ quản lý. Hãy tham gia tích cực vào các dự án!</h3>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function ScoreCard({ label, score, color }) {
  const colorMap = {
    cyan: 'from-cyan-500 text-cyan-400',
    purple: 'from-purple-500 text-purple-400',
    rose: 'from-rose-500 text-rose-400',
    amber: 'from-amber-500 text-amber-400'
  }
  
  return (
    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl items-center hover:bg-white/[0.05] transition-colors">
       <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">{label}</div>
       <div className="flex justify-between items-end">
          <div className={`text-xl font-black text-${color}-400`}>{score ?? '-'}/5</div>
          <div className="flex gap-0.5 pb-1">
             {[1, 2, 3, 4, 5].map(v => (
               <div key={v} className={`h-1 w-2 rounded-full ${v <= score ? `bg-${color}-500 shadow-[0_0_8px_rgba(var(--tw-gradient-from-color))]` : 'bg-white/5'}`}></div>
             ))}
          </div>
       </div>
    </div>
  )
}
