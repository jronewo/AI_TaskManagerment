import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'
import { getTaskById } from '../api/tasks'
import { getAiRecommendations, acceptAiRecommendation } from '../api/ai'
import { getProjectById } from '../api/projects'
import { getTeamById } from '../api/teams'
import { getTaskComments, addTaskComment, deleteTaskComment } from '../api/profile'
import { getUserId, getDisplayName } from '../lib/authStorage'
import { useLang } from '../lib/LanguageContext'

export default function TaskView() {
  const { taskId } = useParams()
  const { t } = useLang()
  const userId = getUserId()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detail')
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [isLeader, setIsLeader] = useState(false)
  const [acceptingUser, setAcceptingUser] = useState(null)

  useEffect(() => {
    fetchTask()
  }, [taskId])

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments()
    }
  }, [activeTab, taskId])

  async function fetchTask() {
    try {
      setLoading(true)
      const data = await getTaskById(taskId)
      setTask(data)
      // Check if current user is project leader
      if (data.projectId && userId) {
        checkLeadership(data.projectId)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function checkLeadership(projectId) {
    try {
      const project = await getProjectById(projectId)
      // Check 1: user is project creator
      if (project.createdBy === Number(userId)) {
        setIsLeader(true)
        return
      }
      // Check 2: user is team leader
      if (project.teamId) {
        const team = await getTeamById(project.teamId)
        const member = team.members?.find(m => m.userId === Number(userId))
        if (member && member.role?.toUpperCase() === 'LEADER') {
          setIsLeader(true)
          return
        }
      }
      setIsLeader(false)
    } catch {
      setIsLeader(false)
    }
  }

  async function fetchComments() {
    try {
      const data = await getTaskComments(taskId)
      setComments(data)
    } catch {}
  }

  async function handleSuggest() {
    if (!task) return
    try {
      setLoadingSuggest(true)
      const data = await getAiRecommendations(Number(taskId), task.projectId)
      setSuggestions(data)
    } catch (err) {
      alert('Lỗi gợi ý: ' + err.message)
    } finally {
      setLoadingSuggest(false)
    }
  }

  async function handleAcceptSuggestion(suggestedUserId) {
    try {
      setAcceptingUser(suggestedUserId)
      await acceptAiRecommendation(Number(taskId), suggestedUserId)
      alert('Đã gán thành công!')
      fetchTask() // Reload to show new assignee
      setSuggestions(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setAcceptingUser(null)
    }
  }

  async function handlePostComment() {
    if (!newComment.trim() || !userId) return
    try {
      setPosting(true)
      await addTaskComment({ taskId: Number(taskId), userId: Number(userId), content: newComment })
      setNewComment('')
      fetchComments()
    } catch (err) {
      alert(err.message)
    } finally {
      setPosting(false)
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm('Xoá bình luận này?')) return
    try {
      await deleteTaskComment(commentId)
      fetchComments()
    } catch {}
  }

  const statusColor = {
    'Todo': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Review': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Done': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  const priorityColor = {
    'Low': 'text-emerald-400',
    'Medium': 'text-amber-400',
    'High': 'text-rose-400',
    'Critical': 'text-rose-500 font-bold',
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#070a12]">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <div className="flex flex-1 items-center justify-center text-slate-400">Đang tải...</div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex h-screen bg-[#070a12]">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <div className="flex flex-1 items-center justify-center text-slate-400">Không tìm thấy task.</div>
        </div>
      </div>
    )
  }

  const hasNoAssignee = !task.assignees || task.assignees.length === 0

  return (
    <div className="flex h-screen bg-[#070a12]">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link>
            <span>/</span>
            {task.projectId && <Link to={`/board/${task.projectId}`} className="hover:text-cyan-400 transition">Project #{task.projectId}</Link>}
            <span>/</span>
            <span className="text-slate-300">Task #{task.taskId}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor[task.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                    {task.status}
                  </span>
                </div>

                {task.description && (
                  <p className="text-slate-300 mb-4 whitespace-pre-wrap">{task.description}</p>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/10 mb-4">
                  {['detail', 'comments', 'dependencies'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium transition rounded-t-lg ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {tab === 'detail' ? t('task_detail') : tab === 'comments' ? t('comment') : t('dep_graph')}
                    </button>
                  ))}
                </div>

                {/* Detail Tab */}
                {activeTab === 'detail' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">Ưu tiên</span>
                        <p className={`font-medium ${priorityColor[task.priority] || 'text-slate-300'}`}>{task.priority || 'N/A'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">Deadline</span>
                        <p className="text-slate-200 font-medium">{task.deadline || 'Chưa đặt'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">Tiến độ</span>
                        <p className="text-slate-200 font-medium">{task.progress ?? 0}%</p>
                        <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all" style={{ width: `${task.progress ?? 0}%` }} />
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">Rủi ro</span>
                        <p className={`font-medium ${task.riskLevel === 'HIGH' ? 'text-rose-400' : task.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {task.riskLevel || 'LOW'}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">Thời gian ước tính</span>
                        <p className="text-slate-200 font-medium">{task.estimatedTime ?? '-'} giờ</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-slate-500 text-xs">AI ước tính</span>
                        <p className="text-cyan-300 font-medium">{task.aiEstimatedTime ?? '-'} giờ</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-3">
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {comments.map(c => (
                        <div key={c.commentId} className="group flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {c.userName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-200">{c.userName}</span>
                              <span className="text-[10px] text-slate-600">{c.createdAt ? new Date(c.createdAt).toLocaleString('vi-VN') : ''}</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5">{c.content}</p>
                            {c.imageUrl && <img src={c.imageUrl} alt="Ảnh bình luận" className="mt-2 max-w-xs rounded-xl border border-white/10" />}
                          </div>
                          {Number(c.userId) === Number(userId) && (
                            <button onClick={() => handleDeleteComment(c.commentId)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition p-1" title="Xoá">✕</button>
                          )}
                        </div>
                      ))}
                      {comments.length === 0 && <p className="text-center text-sm text-slate-500 py-4">Chưa có bình luận.</p>}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                        placeholder="Viết bình luận..."
                        className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/30"
                      />
                      <button
                        onClick={handlePostComment}
                        disabled={posting || !newComment.trim()}
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                      >
                        {posting ? '...' : 'Gửi'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Dependencies Tab */}
                {activeTab === 'dependencies' && (
                  <div className="space-y-2">
                    {task.dependencies?.length > 0 ? task.dependencies.map(dep => (
                      <div key={dep.dependencyId} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span className="text-sm text-slate-300">Phụ thuộc vào: <strong className="text-white">{dep.dependsOnTaskTitle}</strong></span>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${dep.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {dep.status}
                        </span>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">Không có phụ thuộc.</p>
                    )}
                  </div>
                )}
              </div>

              {/* AI Suggestions Panel (full width, below main content) */}
              {suggestions && suggestions.suggestions?.length > 0 && (
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-violet-950/40 p-6 backdrop-blur-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🤖</span>
                    <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-widest">AI Đề xuất người nhận — {suggestions.taskTitle}</h3>
                  </div>
                  {suggestions.requiredSkills?.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500">Kỹ năng yêu cầu:</span>
                      {suggestions.requiredSkills.map(s => (
                        <span key={s.skillId} className="px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 text-[10px] font-bold border border-violet-500/20">
                          {s.skillName} (Lv.{s.requiredLevel})
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {suggestions.suggestions.map((s, i) => (
                      <div key={s.userId} className={`p-4 rounded-xl border transition-all ${i === 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-sm font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-slate-500'}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                            {s.userName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">{s.userName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-cyan-400">{s.score}%</p>
                            <p className="text-[10px] text-slate-500">Tổng điểm</p>
                          </div>
                          {isLeader && hasNoAssignee && (
                            <button
                              onClick={() => handleAcceptSuggestion(s.userId)}
                              disabled={acceptingUser === s.userId}
                              className="ml-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-bold px-3 py-1.5 border border-emerald-500/20 hover:bg-emerald-600/40 disabled:opacity-40"
                            >
                              {acceptingUser === s.userId ? '...' : '✓ Gán'}
                            </button>
                          )}
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-slate-500">Skill Match</p>
                            <p className="text-sm font-bold text-violet-400">{s.skillMatchScore}%</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-slate-500">AI Semantic</p>
                            <p className="text-sm font-bold text-cyan-400">{s.semanticSimilarityScore}%</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-slate-500">Workload</p>
                            <p className="text-sm font-bold text-emerald-400">{s.workloadScore}%</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-slate-500">Performance</p>
                            <p className="text-sm font-bold text-amber-400">{s.performanceScore}%</p>
                          </div>
                        </div>

                        {/* Reason (collapsible) */}
                        {s.reason && (
                          <details className="mt-2">
                            <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300">📊 Xem phân tích chi tiết</summary>
                            <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap bg-black/20 rounded-lg p-3 max-h-40 overflow-y-auto border border-white/5">{s.reason}</pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Assignees */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Người thực hiện</h3>
                {task.assignees?.length > 0 ? (
                  <div className="space-y-2">
                    {task.assignees.map(a => (
                      <div key={a.userId} className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                          {a.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-slate-200">{a.userName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-500 italic mb-3">{t('no_assignee')}</p>
                    {/* Only leader can see and use the AI Suggest button */}
                    {isLeader && (
                      <button
                        onClick={handleSuggest}
                        disabled={loadingSuggest}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-900/20 hover:brightness-110 transition disabled:opacity-50"
                      >
                        {loadingSuggest ? '🔄 Đang phân tích AI...' : t('suggest_assignee')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Task Info */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Thông tin</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Task ID</span><span className="text-slate-200">#{task.taskId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Project</span><span className="text-slate-200">#{task.projectId}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tạo bởi</span><span className="text-slate-200">User #{task.createdBy}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Ngày tạo</span><span className="text-slate-200">{task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '-'}</span></div>
                  {isLeader && (
                    <div className="mt-2 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[10px] font-bold text-amber-400">👑 Bạn là Leader của project này</p>
                    </div>
                  )}
                  {task.aiSummary && (
                    <div className="mt-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <p className="text-xs font-bold text-violet-400 mb-1">🧠 AI Summary</p>
                      <p className="text-xs text-slate-400">{task.aiSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
