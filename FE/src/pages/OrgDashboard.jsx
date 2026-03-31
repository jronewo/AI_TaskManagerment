import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl, safeFetch, parseBody } from '../api/client'
import { createTeam, addTeamMember } from '../api/teams'
import { createProject, searchUsers } from '../api/projects'
import { clearSession, getUserId } from '../lib/authStorage'

export default function OrgManagement() {
  const navigate = useNavigate()
  const [org, setOrg] = useState(null)
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Evaluation Modals State
  const [evalProjectModal, setEvalProjectModal] = useState(null) // projectId
  const [evalLeaderModal, setEvalLeaderModal] = useState(null) // { projectId, leaderId }
  const [evalScore, setEvalScore] = useState(100)
  const [evalFeedback, setEvalFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create Project State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', leaderEmail: '' })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch Current User's Organization
        const orgRes = await safeFetch(apiUrl('api/Organizations/my'))
        if (!orgRes.ok) throw new Error('Không thể tải thông tin tổ chức.')
        const data = await parseBody(orgRes)
        
        if (data && data.org) {
          setOrg(data.org)
          setProjects(data.projects || [])
          
          // Fetch teams related to these projects
          const allTeams = data.projects.map(p => ({
            teamId: p.teamId || p.projectId, // fallback if teamId is null
            name: `Team - ${p.name}`,
            members: new Array(p.teamMemberCount || 0).fill({})
          }))
          setTeams(allTeams)
        } else {
          setError('Bạn chưa thuộc tổ chức nào hoặc phiên làm việc hết hạn.')
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEvaluateProject = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await safeFetch(apiUrl(`api/Organizations/${org.organizationId}/projects/${evalProjectModal}/evaluate`), {
        method: 'POST',
        body: JSON.stringify({
          evaluatorId: org.ownerId,
          overallScore: parseInt(evalScore),
          qualityScore: parseInt(evalScore),
          timelinessScore: parseInt(evalScore),
          communicationScore: parseInt(evalScore),
          comment: evalFeedback
        })
      })
      if (res.ok) {
        alert('Đã đánh giá Dự án thành công!')
        setEvalProjectModal(null)
      } else {
        const text = await parseBody(res)
        alert('Lỗi: ' + (text?.message || JSON.stringify(text)))
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEvaluateLeader = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // Evaluate Leader uses Evaluations endpoint
      const res = await safeFetch(apiUrl(`api/Evaluations`), {
        method: 'POST',
        body: JSON.stringify({
          userId: evalLeaderModal.leaderId, // The person being evaluated
          leaderId: org.ownerId,            // Evaluator (Org Owner)
          skillScore: parseInt(evalScore),
          teamworkScore: parseInt(evalScore),
          deadlineScore: parseInt(evalScore),
          communicationScore: parseInt(evalScore)
        })
      })
      if (res.ok) {
        alert('Đã đánh giá Phụ trách (Leader) thành công!')
        setEvalLeaderModal(null)
      } else {
        const text = await parseBody(res)
        alert('Lỗi: ' + (text?.message || JSON.stringify(text)))
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateOrgProject = async (e) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const uid = parseInt(getUserId() || '0', 10)
      
      let finalLeaderId = null
      if (newProject.leaderEmail.trim()) {
         try {
           const userDetails = await searchUsers(newProject.leaderEmail.trim())
           if (userDetails && userDetails.userId) {
              finalLeaderId = userDetails.userId
           } else {
              throw new Error("Không tìm thấy người dùng với Email này.")
           }
         } catch(err) {
            alert(err.message)
            setIsCreating(false)
            return
         }
      }

      // Create Team
      const team = await createTeam({
         name: `Team - ${newProject.name}`,
         description: `Team phụ trách dự án ${newProject.name} (Tổ chức)`,
         createdBy: uid
      })

      // Assign designated leader
      if (finalLeaderId && finalLeaderId !== uid) {
         try {
           await addTeamMember(team.teamId, finalLeaderId, 'LEADER')
         } catch (e) {
           console.error("Couldn't add specific leader:", e)
           alert("Lỗi khi gán Role Leader cho người dùng này, quá trình tạo vẫn tiếp tục.")
         }
      }

      // Create Project
      await createProject({
         name: newProject.name,
         description: newProject.description,
         organizationId: org.organizationId,
         teamId: team.teamId,
         createdBy: uid
      })
      
      alert("Tạo dự án Tổ chức thành công!")
      setShowCreateModal(false)
      setNewProject({ name: '', description: '', leaderEmail: '' })
      window.location.reload()
    } catch (err) {
      alert("Lỗi tạo dự án: " + err.message)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-neon"></div>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#020617] p-8 text-center">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Truy cập bị từ chối</h2>
        <p className="text-slate-400 mb-8 max-w-md">{error || 'Bạn không có quyền quản lý tổ chức.'}</p>
        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-2 bg-cyan-600 rounded-lg text-white font-bold hover:bg-cyan-500 transition-all">Quay lại Dashboard</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-xl italic uppercase font-outfit">TG</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-tight">{org.name}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Quản trị Tổ chức
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-wider">Cài đặt</button>
             <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-cyan-600 rounded-xl text-xs font-bold text-white hover:bg-cyan-500 transition-all uppercase tracking-wider shadow-lg shadow-cyan-500/20">Thêm dự án (Org)</button>
             <button 
               onClick={() => { clearSession(); navigate('/login'); }}
               className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-all uppercase tracking-wider"
             >
               Đăng xuất
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 sm:p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Teams */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Dự án</div>
                  <div className="text-3xl font-black text-white">{projects.length}</div>
               </div>
               <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all">
                  <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Nhóm</div>
                  <div className="text-3xl font-black text-white">{teams.length}</div>
               </div>
            </div>

            <section>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                 <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
                 Các Nhóm làm việc
               </h3>
               <div className="space-y-3">
                 {teams.map(t => (
                   <div key={t.teamId} className="group flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 uppercase font-black text-xs">
                           {t.name.substring(0, 2)}
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase whitespace-nowrap overflow-hidden max-w-[120px] truncate">{t.name}</div>
                            <div className="text-[10px] text-slate-500">{t.members?.length || 0} thành viên</div>
                         </div>
                      </div>
                      <button className="text-[10px] font-bold text-slate-600 hover:text-white transition-colors">QUẢN LÝ</button>
                   </div>
                 ))}
                 {teams.length === 0 && (
                   <div className="p-8 text-center text-slate-600 italic text-xs border border-dashed border-white/5 rounded-2xl">
                     Chưa có nhóm nào được tạo.
                   </div>
                 )}
               </div>
            </section>
          </div>

          {/* Right Column: Projects List */}
          <div className="lg:col-span-2 space-y-6">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
               <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
               </svg>
               Dự án Tổ chức
             </h3>
             
             <div className="grid sm:grid-cols-2 gap-4">
               {projects.map(p => (
                 <div key={p.projectId} className="group p-5 bg-slate-900/60 border border-white/5 rounded-3xl hover:border-cyan-500/30 transition-all hover:bg-slate-900 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-cyan-500/10 transition-all"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-bold uppercase py-1 px-2 border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 rounded-lg">
                         {p.status || 'Active'}
                       </span>
                       <div className="text-[10px] text-slate-600 font-mono">ID: {p.projectId}</div>
                    </div>
                    
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors uppercase mb-1">{p.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 h-8 mb-4">{p.description || 'Không có mô tả chi tiết dự án này.'}</p>
                    
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] text-slate-600 font-bold uppercase">Tiến độ</span>
                           <span className="text-xs font-bold text-white">{p.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full" style={{ width: `${p.progress}%` }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px]">
                           <div className="text-slate-500">Hạn: <span className="text-slate-300">{p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</span></div>
                           <button onClick={() => window.location.href=`/board/${p.projectId}`} className="text-cyan-600 font-black hover:text-cyan-400 transition-colors">CHI TIẾT ➔</button>
                        </div>
                        
                        {/* Evaluation Buttons */}
                        {p.status === 'Completed' && (
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button 
                              onClick={() => { setEvalProjectModal(p.projectId); setEvalScore(100); setEvalFeedback(''); }}
                              className="flex-1 py-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase hover:bg-emerald-500/20 transition-colors"
                            >
                              Đánh Giá Dự Án
                            </button>
                            {p.pmId && (
                              <button 
                                onClick={() => { setEvalLeaderModal({ projectId: p.projectId, leaderId: p.pmId }); setEvalScore(100); setEvalFeedback(''); }}
                                className="flex-1 py-1.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase hover:bg-amber-500/20 transition-colors"
                              >
                                Đánh Giá Leader
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                 </div>
               ))}
               {projects.length === 0 && (
                 <div className="col-span-full p-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-slate-900/20">
                   <div className="text-3xl mb-4 opacity-30">🚀</div>
                   <h5 className="font-bold text-slate-400 italic">Sẵn sàng khởi tạo dự án đầu tiên?</h5>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>

      {/* Project Evaluation Modal */}
      {evalProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Đánh Giá Dự Án</h3>
            <p className="text-xs text-slate-400 mb-6">Đánh giá mức độ thành công của toàn bộ dự án.</p>
            <form onSubmit={handleEvaluateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Điểm số (0-100)</label>
                <input type="number" min="0" max="100" value={evalScore} onChange={e => setEvalScore(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Nhận xét chi tiết</label>
                <textarea rows="4" value={evalFeedback} onChange={e => setEvalFeedback(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEvalProjectModal(null)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold text-white hover:bg-white/10 transition-colors">HỦY BỎ</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-emerald-600 rounded-xl font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50">LƯU ĐÁNH GIÁ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leader Evaluation Modal */}
      {evalLeaderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Đánh Giá Phụ Trách (Leader)</h3>
            <p className="text-xs text-slate-400 mb-6">Đánh giá năng lực của Quản lý dự án.</p>
            <form onSubmit={handleEvaluateLeader} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Điểm số (0-100)</label>
                <input type="number" min="0" max="100" value={evalScore} onChange={e => setEvalScore(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Nhận xét chi tiết</label>
                <textarea rows="4" value={evalFeedback} onChange={e => setEvalFeedback(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" required></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEvalLeaderModal(null)} className="flex-1 py-3 bg-white/5 rounded-xl font-bold text-white hover:bg-white/10 transition-colors">HỦY BỎ</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-amber-600 rounded-xl font-bold text-white hover:bg-amber-500 transition-colors disabled:opacity-50">LƯU ĐÁNH GIÁ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Org Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6">Tạo Dự án Tổ chức mới</h2>
            <form onSubmit={handleCreateOrgProject} className="space-y-4 relative z-10">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-400 uppercase tracking-wider">Tên dự án *</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Ví dụ: Hệ thống ERP Nội bộ"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-400 uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  placeholder="Mô tả về dự án này..."
                />
              </div>
              <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 mt-6">
                 <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Chỉ định Phụ trách (Leader)
                 </h3>
                 <p className="text-xs text-slate-400 mb-3">Người này sẽ có toàn quyền quản lý Task và Nhóm dự án.</p>
                 <label className="mb-1.5 block text-xs font-bold text-slate-400 uppercase tracking-wider">Email Quản lý (Leader)</label>
                 <input
                   type="email"
                   value={newProject.leaderEmail}
                   onChange={(e) => setNewProject({ ...newProject, leaderEmail: e.target.value })}
                   className="w-full rounded-xl border border-purple-500/30 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                   placeholder="nguyenvan_leader@abc.com"
                 />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                >
                  {isCreating ? 'Đang khởi tạo...' : 'Tạo Dự án & Phân quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
