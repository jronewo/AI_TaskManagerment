import { useState, useEffect, useRef } from 'react'
import AiAssignPanel from './AiAssignPanel'
import { getTaskComments, addTaskComment, deleteTaskComment, uploadImage } from '../../api/profile'
import { runRiskAnalysis, generateSummary, classifyTask } from '../../api/ai'
import { getUserId, getDisplayName } from '../../lib/authStorage'
import { updateTaskSkills } from '../../api/tasks'

export default function TaskDetailModal({ 
  task, 
  isLeader, 
  onClose, 
  allTasks = [],
  onSuggestTime, 
  onUpdateProgress, 
  onUpdateDetails,
  onAddDependency,
  onRemoveDependency
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'Medium',
    deadline: task.deadline ? task.deadline.split('T')[0] : '',
    estimatedTime: task.estimatedTime || '',
    actualTime: task.actualTime || '',
    requiredSkillIds: task.requiredSkillIds || []
  })
  const [availableSkills, setAvailableSkills] = useState([])
  const [progressData, setProgressData] = useState({
    status: task.status || 'Todo',
    progress: task.progress || 0,
    riskLevel: task.riskLevel || 'LOW',
    actualTime: task.actualTime || 0
  })

  // Comment state
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState(null)
  const [commentImagePreview, setCommentImagePreview] = useState(null)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const commentFileRef = useRef(null)
  
  // AI Genie state
  const [loadingAi, setLoadingAi] = useState('')
  const [aiResult, setAiResult] = useState(null)

  const userId = getUserId()

  // Fetch comments when tab switches
  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments()
    }
  }, [activeTab])

  async function fetchComments() {
    setLoadingComments(true)
    try {
      const data = await getTaskComments(task.taskId)
      setComments(data)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    async function loadSkills() {
      try {
        const { apiUrl, safeFetch, parseBody } = await import('../../api/client')
        const res = await safeFetch(apiUrl('api/Skills'))
        const data = await parseBody(res)
        if (Array.isArray(data)) setAvailableSkills(data)
      } catch (err) {
        console.error("Lỗi tải skills:", err)
      }
    }
    loadSkills()
  }, [])

  const handleToggleSkill = (skillId) => {
    setFormData(prev => {
      const skills = prev.requiredSkillIds || [];
      if (skills.includes(skillId)) {
        return { ...prev, requiredSkillIds: skills.filter(id => id !== skillId) }
      } else {
        return { ...prev, requiredSkillIds: [...skills, skillId] }
      }
    })
  }

  async function handleSubmitComment(e) {
    e.preventDefault()
    if (!commentText.trim() && !commentImage) return
    if (!userId) return alert('Bạn cần đăng nhập để bình luận.')

    setSubmittingComment(true)
    try {
      let imageUrl = null

      // Upload image first if exists
      if (commentImage) {
        setUploadingImage(true)
        try {
          const uploadResult = await uploadImage(commentImage, 'taskgenie/comments')
          imageUrl = uploadResult.imageUrl
        } catch (err) {
          alert('Không thể upload ảnh: ' + err.message)
          setUploadingImage(false)
          setSubmittingComment(false)
          return
        }
        setUploadingImage(false)
      }

      await addTaskComment({
        taskId: task.taskId,
        userId: parseInt(userId),
        content: commentText.trim() || null,
        imageUrl
      })

      setCommentText('')
      setCommentImage(null)
      setCommentImagePreview(null)
      fetchComments()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Xóa bình luận này?')) return
    try {
      await deleteTaskComment(commentId)
      setComments(prev => prev.filter(c => c.commentId !== commentId))
    } catch (err) {
      alert(err.message)
    }
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Ảnh phải nhỏ hơn 10MB.')
      return
    }
    setCommentImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setCommentImagePreview(ev.target?.result)
    reader.readAsDataURL(file)
  }

  function removeImagePreview() {
    setCommentImage(null)
    setCommentImagePreview(null)
    if (commentFileRef.current) commentFileRef.current.value = ''
  }

  // Edit Handlers
  const handleSaveDetails = async () => {
    const payload = { ...formData }
    if (!payload.deadline) delete payload.deadline
    if (payload.estimatedTime === '') payload.estimatedTime = null
    if (payload.actualTime === '') payload.actualTime = null
    delete payload.requiredSkillIds // Optional: remove before sending general update
    
    await onUpdateDetails(task.taskId, payload)
    
    // Gán lại tags
    if (formData.requiredSkillIds) {
       await updateTaskSkills(task.taskId, formData.requiredSkillIds)
    }

    setEditing(false)
  }

  // Progress Handlers
  const handleSaveProgress = async () => {
    await onUpdateProgress(task.taskId, progressData)
  }

  // Image lightbox
  const [lightboxUrl, setLightboxUrl] = useState(null)

  // AI Actions handler
  const handleAiAction = async (actionId, actionFn) => {
    setLoadingAi(actionId)
    setAiResult(null)
    try {
      const res = await actionFn(task.taskId)
      setAiResult({ type: 'success', message: res.message || 'Hoàn tất phân tích AI!' })
    } catch (err) {
      setAiResult({ type: 'error', message: err.message })
    } finally {
      setLoadingAi('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="text-xl font-bold text-white shrink-0">Chi tiết Task</h2>
          <div className="flex gap-2 items-center">
            {isLeader && !editing && activeTab === 'details' && (
              <button onClick={() => setEditing(true)} className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
                Chỉnh sửa
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/10 px-5 pt-3">
          {['details', 'progress', 'comments', 'dependencies'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'details' ? 'Thông tin chung' : tab === 'progress' ? 'Cập nhật tiến độ' : tab === 'comments' ? `Bình luận (${comments.length})` : 'Dependencies'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'details' && (
            <div className="max-w-2xl space-y-6">
              {editing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Tiêu đề</label>
                    <input 
                      type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full rounded-lg bg-slate-800 p-2 text-white border border-white/10" 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-400">Mô tả</label>
                    <textarea 
                      rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full rounded-lg bg-slate-800 p-2 text-white border border-white/10" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">Thời gian dự kiến (giờ)</label>
                      <input 
                        type="number" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})}
                        className="w-full rounded-lg bg-slate-800 p-2 text-white border border-white/10" 
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-slate-400">Hạn chót</label>
                      <input 
                        type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                        className="w-full rounded-lg bg-slate-800 p-2 text-white border border-white/10" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Kỹ năng yêu cầu (Tags)</label>
                    <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-800 p-3 min-h-[50px]">
                      {availableSkills.map(skill => {
                        const isSelected = (formData.requiredSkillIds || []).includes(skill.skillId);
                        return (
                          <button
                            type="button"
                            key={skill.skillId}
                            onClick={() => handleToggleSkill(skill.skillId)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                              isSelected 
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-sm shadow-cyan-900/20' 
                                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {skill.skillName} {isSelected && '×'}
                          </button>
                        )
                      })}
                      {availableSkills.length === 0 && <span className="text-xs text-slate-500">Đang tải...</span>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                     <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-300">Hủy</button>
                     <button onClick={handleSaveDetails} className="bg-cyan-600 px-4 py-2 rounded-lg text-sm text-white">Lưu lại</button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{task.title}</h3>
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300">{task.priority}</span>
                      <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300">{task.status}</span>
                      {task.deadline && (
                         <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-rose-300">
                           Hạn: {new Date(task.deadline).toLocaleDateString()}
                         </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Mô tả chi tiết</h4>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-300 whitespace-pre-wrap">
                      {task.description || 'Không có mô tả.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Thời gian (Hours)</h4>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-slate-500">Thực tế / Dự kiến</p>
                          <p className="text-lg text-white font-medium">{task.actualTime || 0} <span className="text-sm text-slate-500">/ {task.estimatedTime || 0}</span></p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-slate-500">AI Ước tính</p>
                            <p className="text-cyan-400 font-medium">{task.aiEstimatedTime ? `${task.aiEstimatedTime} h` : 'Chưa có'}</p>
                          </div>
                          {isLeader && (
                            <button onClick={() => onSuggestTime(task.taskId)} className="rounded bg-cyan-500/10 px-2 py-1 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20">
                              🤖 AI Gợi ý
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                       <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phân công</h4>
                       <div className="flex flex-wrap gap-2">
                         {task.assignees?.map(a => (
                           <div key={a.userId} className="flex items-center gap-2 bg-slate-800 rounded-full pl-1 pr-3 py-1 border border-white/5">
                             <img src={a.avatar || `https://ui-avatars.com/api/?name=${a.userName}`} className="w-6 h-6 rounded-full" />
                             <span className="text-xs text-slate-300">{a.userName}</span>
                           </div>
                         ))}
                         {(!task.assignees || task.assignees.length === 0) && (
                           <p className="text-xs text-slate-500">Chưa ai được gán</p>
                         )}
                       </div>
                       
                       {isLeader && (
                         <AiAssignPanel 
                           task={task}
                           projectId={task.projectId} 
                           onAssigned={() => window.location.reload()} 
                         />
                       )}
                    </div>
                  </div>

                  {/* AI Genie Toolkit (Leader only) */}
                  {isLeader && (
                    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/20 p-5 mt-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                      <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-lg">🤖</span> AI Genie Toolkit
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 max-w-lg">Cấp quyền để AI tự động phân tích rủi ro, phân loại độ khó và tạo tóm tắt thông minh cho task này.</p>
                      
                      {aiResult && (
                        <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-medium border ${
                          aiResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {aiResult.message}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-sm z-10 relative">
                        <button 
                          onClick={() => handleAiAction('risk', runRiskAnalysis)}
                          disabled={!!loadingAi}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {loadingAi === 'risk' ? '...' : '🚨'} Phân tích Rủi ro
                        </button>
                        <button 
                          onClick={() => handleAiAction('classify', classifyTask)}
                          disabled={!!loadingAi}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {loadingAi === 'classify' ? '...' : '🏷️'} Phân loại Tự động
                        </button>
                        <button 
                          onClick={() => handleAiAction('summary', generateSummary)}
                          disabled={!!loadingAi}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {loadingAi === 'summary' ? '...' : '📝'} Sinh Tóm tắt
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="max-w-md space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Trạng thái hiện tại</label>
                <select 
                  value={progressData.status} 
                  onChange={e => {
                    const status = e.target.value
                    setProgressData({...progressData, status, progress: status === 'Done' ? 100 : progressData.progress})
                  }}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500"
                >
                  <option value="Todo">Todo (Cần làm)</option>
                  <option value="In Progress">In Progress (Đang làm)</option>
                  <option value="Review">Review (Chờ duyệt)</option>
                  <option value="Done">Done (Hoàn thành)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex justify-between text-sm font-medium text-slate-300">
                  <span>Tiến độ phần trăm</span>
                  <span className="text-cyan-400">{progressData.progress}%</span>
                </label>
                <input 
                  type="range" min="0" max="100" 
                  value={progressData.progress} 
                  onChange={e => setProgressData({...progressData, progress: parseInt(e.target.value)})}
                  className="w-full accent-cyan-500"
                  disabled={progressData.status === 'Done'}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Cảnh báo rủi ro (Risk)</label>
                <select 
                  value={progressData.riskLevel} 
                  onChange={e => setProgressData({...progressData, riskLevel: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-rose-500"
                >
                  <option value="LOW">Thấp (Low)</option>
                  <option value="MEDIUM">Trung bình (Medium)</option>
                  <option value="HIGH">Cao (High)</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Log thời gian thực tế (Giờ)</label>
                <input 
                  type="number" 
                  value={progressData.actualTime} 
                  onChange={e => setProgressData({...progressData, actualTime: parseInt(e.target.value)})}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-white focus:border-cyan-500"
                  placeholder="Ví dụ: 4"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                 <button onClick={handleSaveProgress} className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white hover:bg-cyan-500">
                   Lưu Tiến Độ
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="max-w-2xl space-y-6">
              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="bg-slate-800/50 rounded-2xl border border-white/10 p-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận..."
                  rows={3}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none"
                />
                
                {/* Image Preview */}
                {commentImagePreview && (
                  <div className="relative mt-3 inline-block">
                    <img 
                      src={commentImagePreview} 
                      alt="Preview" 
                      className="max-h-32 rounded-xl border border-white/10 object-cover"
                    />
                    <button 
                      type="button"
                      onClick={removeImagePreview}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center hover:bg-rose-400 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input 
                      ref={commentFileRef}
                      type="file" 
                      accept="image/jpeg,image/png,image/gif,image/webp" 
                      className="hidden" 
                      onChange={handleImageSelect}
                    />
                    <button 
                      type="button"
                      onClick={() => commentFileRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Đính kèm ảnh
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={submittingComment || (!commentText.trim() && !commentImage)}
                    className="px-4 py-2 rounded-lg bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <>
                        <div className="h-3 w-3 border border-white/50 border-t-white rounded-full animate-spin"></div>
                        {uploadingImage ? 'Đang tải ảnh...' : 'Đang gửi...'}
                      </>
                    ) : 'Gửi bình luận'}
                  </button>
                </div>
              </form>

              {/* Comments List */}
              {loadingComments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-white/[0.02] rounded-xl animate-pulse border border-white/5"></div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-3xl mb-3 opacity-20">💬</div>
                  <p className="text-sm text-slate-500 italic">Chưa có bình luận nào cho task này.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.commentId} className="group p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                      <div className="flex items-start gap-3">
                        {comment.userAvatar ? (
                          <img src={comment.userAvatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {(comment.userName || '??').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{comment.userName || 'Người dùng'}</span>
                            {comment.createdAt && (
                              <span className="text-[10px] text-slate-600 tabular-nums">
                                {new Date(comment.createdAt).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                          {comment.content && (
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                          )}
                          {comment.imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={comment.imageUrl} 
                                alt="Comment attachment" 
                                className="max-h-48 rounded-xl border border-white/10 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setLightboxUrl(comment.imageUrl)}
                              />
                            </div>
                          )}
                        </div>
                        {parseInt(userId) === comment.userId && (
                          <button 
                            onClick={() => handleDeleteComment(comment.commentId)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              {isLeader && (
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-slate-400 mb-2">Chọn Task mà task này phụ thuộc vào:</label>
                    <select 
                      id="depId" 
                      className="w-full rounded bg-slate-900 p-2 text-sm text-white border border-white/10"
                    >
                      <option value="">-- Chọn Task --</option>
                      {allTasks.filter(t => t.taskId !== task.taskId).map(t => (
                        <option key={t.taskId} value={t.taskId}>
                          #{t.taskId} - {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => {
                    const v = document.getElementById('depId').value;
                    if (v) onAddDependency(task.taskId, parseInt(v));
                  }} className="bg-cyan-600 px-4 py-2 text-sm text-white rounded font-medium hover:bg-cyan-500">
                    Thêm
                  </button>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Tasks bị phụ thuộc (Phải xong trước khi làm task này)</h4>
                {task.dependencies?.length > 0 ? (
                  <ul className="space-y-2">
                    {task.dependencies.map(d => (
                      <li key={d.dependencyId} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-sm text-slate-200">#{d.dependsOnTaskId} - {d.dependsOnTaskTitle}</p>
                          <span className={`text-[10px] ${d.status === 'Done' ? 'text-emerald-400' : 'text-amber-400'}`}>Trạng thái: {d.status}</span>
                        </div>
                        {isLeader && (
                          <button onClick={() => onRemoveDependency(task.taskId, d.dependencyId)} className="text-rose-400 hover:text-rose-300 text-sm">
                            Gỡ
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Không có dependencies.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <img 
            src={lightboxUrl} 
            alt="Full size" 
            className="max-w-[90vw] max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-lg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
