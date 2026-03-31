import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl, safeFetch, parseBody } from '../api/client'
import { clearSession } from '../lib/authStorage'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0,
    organizations: 0,
    projects: 0,
    tasks: 0,
    tasksDone: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await safeFetch(apiUrl('api/Admin/platform-stats'))
        const data = await parseBody(res)
        if (res.ok) setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-slate-200">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">Nền tảng Quản Trị Hệ Thống</h1>
          <button 
            onClick={() => { clearSession(); navigate('/login'); }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
          >
            Đăng xuất
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-center">
             <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Người dùng</div>
             <div className="text-5xl font-black text-cyan-400">{stats.users}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-center">
             <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Tổ chức</div>
             <div className="text-5xl font-black text-purple-400">{stats.organizations}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-center">
             <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Dự án Tự động</div>
             <div className="text-5xl font-black text-emerald-400">{stats.projects}</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 text-center">
             <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Tasks Đã Hoàn Thành</div>
             <div className="text-5xl font-black text-orange-400">{stats.tasksDone} <span className="text-xl text-slate-500">/ {stats.tasks}</span></div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-slate-500 text-sm">
          Phiên bản Quản trị viên (Admin Level). Hệ thống hoạt động bình thường.
        </div>
      </div>
    </div>
  )
}
