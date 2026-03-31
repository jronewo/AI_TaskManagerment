import { useState } from 'react'
import { createProject, searchUsers, addMemberByEmail } from '../../api/projects'

export function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const newProject = await createProject({ name, description, status: 'Active' })
      onSuccess(newProject)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase mb-6">Tạo dự án mới</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Tên dự án</label>
            <input 
              autoFocus
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Ví dụ: AI Task Manager"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Mô tả ngắn</label>
            <textarea 
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
              placeholder="Mục tiêu của dự án này là gì?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-white/5 text-slate-400 font-bold text-xs uppercase rounded-2xl hover:bg-white/10 transition-colors">
              Hủy
            </button>
            <button disabled={busy} type="submit" className="flex-1 px-6 py-4 bg-cyan-600 text-white font-black text-xs uppercase rounded-2xl hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 transition-all">
              {busy ? 'Đang tạo...' : 'Xác nhận ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function InviteMemberModal({ isOpen, onClose, projectId }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  async function handleSearch(q) {
    setQuery(q)
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const data = await searchUsers(q)
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(email) {
    setBusy(email)
    try {
      await addMemberByEmail(projectId, email)
      alert(`Đã mời ${email} vào dự án!`)
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <h2 className="text-xl font-black text-white uppercase mb-2">Tuyển thành viên 🤝</h2>
        <p className="text-xs text-slate-400 mb-6">Tìm kiếm thành viên theo tên hoặc email để mời vào đội ngũ của bạn.</p>
        
        <div className="relative mb-6">
          <input 
            autoFocus
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Nhập email hoặc tên thành viên..."
          />
          <svg className="absolute left-4 top-4 h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
          {loading && <div className="text-center py-4 text-slate-500 text-xs italic">Đang tìm kiếm...</div>}
          {results.map(u => (
            <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white uppercase">
                  {u.displayName.substring(0, 2)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{u.displayName}</div>
                  <div className="text-[10px] text-slate-500 font-medium">{u.email}</div>
                </div>
              </div>
              <button 
                disabled={busy === u.email}
                onClick={() => handleInvite(u.email)}
                className="px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-purple-500 transition-colors"
              >
                {busy === u.email ? 'Đang mời...' : 'Mời'}
              </button>
            </div>
          ))}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs italic">Không tìm thấy người dùng phù hợp.</div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
