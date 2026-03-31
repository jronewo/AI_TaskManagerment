import { useState, useEffect } from 'react'
import { AdminLayout } from '../layouts/AdminLayout'
import { apiUrl, safeFetch, parseBody } from '../api/client'

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([])
  const [loneProjects, setLoneProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch All Organizations (Global Admin View)
        const orgRes = await safeFetch(apiUrl('api/Organizations/admin/all'))
        const orgData = await parseBody(orgRes)
        
        // Fetch All Projects to find standalone ones
        const projRes = await safeFetch(apiUrl('api/Projects'))
        const allProjects = await parseBody(projRes)
        
        if (Array.isArray(orgData)) {
          setOrgs(orgData)
        }
        
        if (Array.isArray(allProjects)) {
          const lone = allProjects.filter(p => !p.organizationId)
          setLoneProjects(lone)
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-8 max-w-4xl">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Quản trị Hệ thống 🛠️
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Quản lý tất cả các tổ chức và các dự án lẻ trên toàn bộ hệ thống. 
            Phân quyền đầy đủ cho phép bạn giám sát mọi hoạt động.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-400">
             Lỗi: {error}
          </div>
        )}

        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-cyan-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Danh sách các Tổ chức ({orgs.length})
          </h2>
          
          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/40 backdrop-blur-md shadow-2xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/[0.03] text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Tên tổ chức</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Dự án trực thuộc</th>
                  <th className="px-6 py-4">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {orgs.map((org) => (
                  <tr key={org.organizationId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{org.name}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{org.description || 'Không có mô tả'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {org.projects && org.projects.length > 0 ? org.projects.map(p => (
                          <span key={p.projectId} className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400 border border-cyan-500/20">
                            {p.name}
                          </span>
                        )) : <span className="text-slate-600 italic">Chưa có dự án</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-xs font-medium text-slate-500 hover:text-cyan-400 transition-colors">Quản lý</button>
                    </td>
                  </tr>
                ))}
                {orgs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">
                      Chưa có tổ chức nào được đăng ký trên hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-rose-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Dự án Lẻ - Standalone ({loneProjects.length})
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loneProjects.map(proj => (
              <div key={proj.projectId} className="group relative rounded-2xl border border-white/[0.07] bg-slate-950/40 p-5 hover:border-rose-500/30 transition-all shadow-lg hover:shadow-rose-500/5">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20`}>
                    {proj.status || 'Standalone'}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">#{proj.projectId}</div>
                </div>
                <h3 className="mb-1 text-base font-semibold text-white group-hover:text-rose-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">{proj.description || 'Không có mô tả'}</p>
                
                <div className="mt-4 pt-4 border-t border-white/[0.05] flex justify-between items-center">
                  <div className="text-[10px] text-slate-400">
                    Hạn: {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Không có'}
                  </div>
                  <button className="text-[11px] font-medium text-slate-500 hover:text-white transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            ))}
            {loneProjects.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
                Không tìm thấy dự án lẻ nào.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
