import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { apiUrl, safeFetch, parseBody } from '../api/client'
import { useLang } from '../lib/LanguageContext'

export default function Feed() {
  const { t } = useLang()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 1. Fetch available projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true)
        const res = await safeFetch(apiUrl('api/projects'))
        const data = await parseBody(res)
        if (Array.isArray(data)) {
          setProjects(data)
        }
      } catch (err) {
        setError("Lỗi tải danh sách dự án: " + err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // 2. Fetch activities when a project is selected
  useEffect(() => {
    if (!selectedProject) return;
    
    async function fetchProjectLogs() {
      try {
        setIsLoading(true)
        const res = await safeFetch(apiUrl(`api/ActivityLogs/project/${selectedProject.projectId}?limit=100`))
        const data = await parseBody(res)
        if (Array.isArray(data)) {
          setActivities(data)
        }
      } catch (err) {
        setError("Lỗi tải activity log: " + err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjectLogs()
  }, [selectedProject])

  const actionIcon = (action) => {
    if (!action) return '📌'
    const a = action.toLowerCase()
    if (a.includes('create') || a.includes('tạo')) return '✨'
    if (a.includes('update') || a.includes('cập nhật')) return '✏️'
    if (a.includes('delete') || a.includes('xoá') || a.includes('xóa')) return '🗑️'
    if (a.includes('comment') || a.includes('bình luận')) return '💬'
    if (a.includes('assign') || a.includes('gán')) return '👤'
    if (a.includes('status') || a.includes('trạng thái')) return '🔄'
    return '📌'
  }

  const entityLink = (type, id) => {
    if (!type || !id) return null
    if (type.toLowerCase().includes('task')) return `/task/${id}`
    if (type.toLowerCase().includes('project')) return `/board/${id}`
    return null
  }

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8 max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            {selectedProject && (
              <button 
                onClick={() => { setSelectedProject(null); setActivities([]); }}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all shadow-lg"
              >
                ←
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                {selectedProject ? `Feed: ${selectedProject.projectName}` : t('feed_title')}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {selectedProject ? "Lịch sử hoạt động riêng của dự án này." : "Vui lòng chọn một dự án để xem luồng hoạt động."}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">
            ⚠️ Lỗi: {error}
          </div>
        )}

        {!selectedProject ? (
          // View 1: Project Selection
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {isLoading && !projects.length ? (
               [1,2,3].map(i => <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-2xl"></div>)
            ) : projects.length === 0 ? (
               <div className="col-span-full py-12 text-center text-sm text-slate-500">Chưa có dự án nào</div>
            ) : projects.map(p => (
              <div 
                key={p.projectId} 
                onClick={() => setSelectedProject(p)}
                className="cursor-pointer group p-5 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg">
                  📁
                </div>
                <h3 className="font-bold text-white text-center group-hover:text-cyan-400">{p.projectName}</h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-white/5">Xem Activity</span>
              </div>
            ))}
          </div>
        ) : (
          // View 2: Activities Timeline
          <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-white/10"></div>
          
          <div className="space-y-6">
            {activities.map((act) => {
              const link = entityLink(act.entityType, act.entityId)
              return (
                <div key={act.logId} className="relative pl-10 group">
                  {/* Timeline Dot */}
                  <div className="absolute left-[13px] top-2 h-2.5 w-2.5 rounded-full bg-slate-800 border-2 border-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)] z-10 group-hover:scale-125 transition-transform"></div>
                  
                  <div className="p-5 bg-slate-900/40 border border-white/[0.04] rounded-2xl hover:border-white/10 transition-all shadow-xl backdrop-blur-md">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <span className="text-base">{actionIcon(act.action)}</span>
                           <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">{act.action || 'ACTION'}</span>
                           <span className="text-slate-700">·</span>
                           <span className="text-xs font-bold text-white">{act.userName || 'Hệ thống'}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tabular-nums">
                          {act.createdAt ? new Date(act.createdAt).toLocaleString('vi-VN') : ''}
                        </span>
                     </div>
                     
                     <p className="text-sm text-slate-300 leading-relaxed">
                       {act.entityType && <span className="font-medium text-slate-400">[{act.entityType}]</span>}{' '}
                       {act.entityId ? `#${act.entityId}` : ''}
                     </p>
                     
                     {link && (
                       <div className="mt-3 pt-3 border-t border-white/5">
                          <Link to={link} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition border border-cyan-500/20">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Xem {act.entityType} #{act.entityId}
                          </Link>
                       </div>
                     )}
                  </div>
                </div>
              )
            })}

            {activities.length === 0 && !isLoading && (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-slate-900/20 ml-10">
                 <div className="text-3xl mb-4 opacity-20">📡</div>
                 <h3 className="text-slate-500 font-bold italic tracking-tight">{t('no_activity')}</h3>
              </div>
            )}
            
            {isLoading && (
               <div className="space-y-4 ml-10">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 w-full bg-white/[0.02] border border-white/5 animate-pulse rounded-2xl"></div>
                  ))}
               </div>
            )}
          </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
