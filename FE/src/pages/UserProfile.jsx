import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { apiUrl, safeFetch, parseBody } from '../api/client'
import { getUserId, getDisplayName, getEmailFromToken, getRole } from '../lib/authStorage'
import { getUserProfile, updateProfile, uploadAvatar, changePassword } from '../api/profile'

const TABS = [
  { id: 'profile', label: 'Thông tin', icon: '👤' },
  { id: 'skills', label: 'Kỹ năng', icon: '⚡' },
  { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
]

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [userSkills, setUserSkills] = useState([])
  const [availableSkills, setAvailableSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [skillLevel, setSkillLevel] = useState(3)
  const [error, setError] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef(null)

  // Password State
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)
  const [passError, setPassError] = useState('')

  const userId = getUserId()
  const userName = getDisplayName()
  const userEmail = getEmailFromToken()
  const userRole = getRole()

  const isOnboarding = new URLSearchParams(window.location.search).get('first') === 'true' || userSkills.length === 0

  useEffect(() => {
    async function fetchData() {
      if (!userId) return
      try {
        setIsLoading(true)
        
        const userSkillRes = await safeFetch(apiUrl(`api/Skills/user/${userId}`))
        const userSkillData = await parseBody(userSkillRes)
        
        const allSkillRes = await safeFetch(apiUrl('api/Skills'))
        const allSkillData = await parseBody(allSkillRes)
        
        if (Array.isArray(userSkillData)) setUserSkills(userSkillData)
        if (Array.isArray(allSkillData)) setAvailableSkills(allSkillData)

        try {
          const profile = await getUserProfile(userId)
          setProfileData(profile)
          setNewName(profile.name || '')
        } catch {
          // Profile endpoint may not be available
        }

      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!selectedSkill) return

    try {
      const res = await safeFetch(apiUrl('api/Skills/user'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          skillId: parseInt(selectedSkill),
          level: parseInt(skillLevel)
        })
      })
      
      if (res.ok) {
        const updatedRes = await safeFetch(apiUrl(`api/Skills/user/${userId}`))
        const updatedData = await parseBody(updatedRes)
        setUserSkills(updatedData)
        setSelectedSkill('')
        showSuccess('Đã thêm kỹ năng thành công!')
      } else {
        const errData = await parseBody(res)
        alert(errData.message || 'Không thể thêm kỹ năng.')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleRemoveSkill = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa kỹ năng này?')) return
    try {
      const res = await safeFetch(apiUrl(`api/Skills/user/${id}`), { method: 'DELETE' })
      if (res.ok) {
        setUserSkills(prev => prev.filter(s => s.id !== id))
        showSuccess('Đã xóa kỹ năng.')
      }
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim() || !userId) return
    setSavingProfile(true)
    try {
      const updated = await updateProfile(userId, { name: newName.trim() })
      setProfileData(prev => ({ ...prev, ...updated }))
      setEditingName(false)
      showSuccess('Đã cập nhật tên thành công!')
    } catch (err) {
      alert(err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh phải nhỏ hơn 5MB.')
      return
    }

    setUploadingAvatar(true)
    try {
      const result = await uploadAvatar(userId, file)
      if (result.avatarUrl) {
        setProfileData(prev => ({ ...prev, avatar: result.avatarUrl }))
        showSuccess('Đã cập nhật ảnh đại diện!')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassError('')
    if (passwordData.new !== passwordData.confirm) {
      return setPassError('Mật khẩu mới không khớp.')
    }
    if (passwordData.new.length < 6) {
      return setPassError('Mật khẩu mới phải có ít nhất 6 ký tự.')
    }
    
    setChangingPassword(true)
    try {
      await changePassword(userId, passwordData.current, passwordData.new)
      setShowPasswordModal(false)
      setPasswordData({ current: '', new: '', confirm: '' })
      showSuccess('Đổi mật khẩu thành công!')
    } catch (err) {
      setPassError(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  function showSuccess(msg) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const avatarUrl = profileData?.avatar
  const displayName = profileData?.name || userName || 'Người dùng'

  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-8 max-w-5xl mx-auto">
        {/* Success Toast */}
        {successMsg && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl shadow-2xl">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-sm font-bold text-emerald-300">{successMsg}</span>
            </div>
          </div>
        )}

        {/* Onboarding Banner */}
        {isOnboarding && userSkills.length === 0 && (
          <div className="mb-10 p-8 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-3xl backdrop-blur-md">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Chào mừng bạn đến với TaskGenie! 🚀</h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Để bắt đầu, hãy chọn ít nhất <strong>một kỹ năng</strong> chuyên môn của bạn. Điều này giúp hệ thống AI đề xuất các dự án phù hợp nhất với năng lực của bạn.
            </p>
          </div>
        )}

        {/* Profile Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="h-24 w-24 rounded-3xl object-cover shadow-2xl shadow-cyan-500/20 ring-2 ring-white/10"
              />
            ) : (
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-cyan-500/20 uppercase">
                {displayName ? displayName.substring(0, 2) : '??'}
              </div>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 rounded-3xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              {uploadingAvatar ? (
                <div className="h-6 w-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              className="hidden" 
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" value={newName} onChange={e => setNewName(e.target.value)}
                    className="text-2xl font-black text-white bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    autoFocus
                  />
                  <button onClick={handleSaveName} disabled={savingProfile} className="text-cyan-400 hover:text-cyan-300 text-sm font-bold">
                    {savingProfile ? '...' : '✓'}
                  </button>
                  <button onClick={() => { setEditingName(false); setNewName(profileData?.name || userName || '') }} className="text-slate-500 hover:text-slate-300 text-sm font-bold">
                    ✕
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-black text-white tracking-tight uppercase cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setEditingName(true)}>
                  {displayName}
                  <span className="ml-2 text-xs text-slate-600 normal-case font-normal">(click để sửa)</span>
                </h1>
              )}
            </div>
            <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
              <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {userEmail}
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[10px] font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                {userRole || 'Thành viên'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[10px] font-bold text-purple-400 border border-purple-500/20 uppercase tracking-widest">Verified 🛡️</span>
              {profileData?.createdAt && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-slate-500 border border-white/10 uppercase tracking-widest">
                  Từ {new Date(profileData.createdAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>
          
          {userSkills.length > 0 && (
            <a href="/dashboard" className="px-6 py-3 bg-white text-slate-900 font-black text-xs uppercase rounded-xl hover:bg-cyan-400 transition-colors shadow-xl shrink-0">
              Đến Dashboard →
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-900/50 rounded-2xl p-1 border border-white/5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <section className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-xs text-slate-500 uppercase font-bold">Tên</span>
                  <span className="text-sm text-white font-medium">{displayName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-xs text-slate-500 uppercase font-bold">Email</span>
                  <span className="text-sm text-white font-medium">{userEmail}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-xs text-slate-500 uppercase font-bold">Vai trò</span>
                  <span className="text-sm text-cyan-400 font-bold uppercase">{userRole || 'NORMAL_USER'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-xs text-slate-500 uppercase font-bold">Kỹ năng</span>
                  <span className="text-sm text-purple-400 font-bold">{userSkills.length} kỹ năng</span>
                </div>
              </div>
            </section>

            {/* Linked Accounts */}
            <section className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Liên kết tài khoản
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="h-5 w-5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Google</p>
                    <p className="text-xs text-slate-500">{userEmail}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                    Đã kết nối
                  </span>
                </div>
              </div>
            </section>

            {/* AI Insight */}
            <section className="md:col-span-2 p-8 bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-white/5 rounded-[32px] relative overflow-hidden">
               <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
               <h3 className="text-sm font-bold text-white mb-2 italic">Tư vấn lộ trình ⚡</h3>
               <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                 Hệ thống AI của TaskGenie sẽ tự động phân tích kỹ năng của bạn để gợi ý các dự án phù hợp nhất. Cập nhật hồ sơ thường xuyên để có kết quả chính xác.
               </p>
            </section>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Kỹ năng chuyên môn ({userSkills.length})
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {userSkills.map(sk => (
                    <div key={sk.id} className="group p-5 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase mb-1">{sk.skillName}</div>
                        <div className="flex gap-1.5 mt-2">
                          {[1, 2, 3, 4, 5].map(lv => (
                            <div key={lv} className={`h-1.5 w-6 rounded-full ${lv <= sk.level ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-white/5'}`}></div>
                          ))}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Cấp độ {sk.level}/5</div>
                      </div>
                      <button onClick={() => handleRemoveSkill(sk.id)} className="text-slate-700 hover:text-rose-500 transition-colors">
                         <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                      </button>
                    </div>
                  ))}
                  {userSkills.length === 0 && (
                    <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-white/5 text-slate-500 italic text-sm">
                      Bạn chưa cập nhật kỹ năng nào.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-24 shadow-2xl">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Thêm kỹ năng mới
                </h3>
                
                <form onSubmit={handleAddSkill} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 ml-1">Chọn kỹ năng</label>
                    <select 
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none transition-all cursor-pointer"
                    >
                      <option className="bg-slate-900" value="">--- Lựa chọn ---</option>
                      {availableSkills.map(s => (
                        <option className="bg-slate-900" key={s.skillId} value={s.skillId}>{s.skillName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold uppercase text-slate-500 ml-1">Mức độ thuần thục</label>
                      <span className="text-[10px] font-black text-cyan-400 uppercase">{skillLevel}/5</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full accent-cyan-500 h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-black uppercase py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] mt-4"
                  >
                    CẬP NHẬT HỒ SƠ
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Theme Settings */}
            <section className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <span className="text-lg">🎨</span>
                Giao diện
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Dark Mode</p>
                      <p className="text-xs text-slate-500 mt-1">Giao diện tối — mặc định</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-cyan-500 relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md"></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">Light Mode</p>
                      <p className="text-xs text-slate-500 mt-1">Giao diện sáng — sắp ra mắt</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-slate-700 relative cursor-not-allowed">
                      <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-slate-500 shadow-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Language */}
            <section className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <span className="text-lg">🌐</span>
                Ngôn ngữ
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-cyan-500/30 flex items-center gap-3">
                  <span className="text-xl">🇻🇳</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">Tiếng Việt</p>
                    <p className="text-xs text-slate-500">Ngôn ngữ hiện tại</p>
                  </div>
                  <span className="text-cyan-400 text-xs font-bold">✓</span>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 flex items-center gap-3 opacity-50 cursor-not-allowed">
                  <span className="text-xl">🇺🇸</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">English</p>
                    <p className="text-xs text-slate-500">Sắp ra mắt</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section className="md:col-span-2 p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                Bảo mật
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-white mb-1">Đổi mật khẩu</p>
                  <p className="text-xs text-slate-500 mb-4">Cập nhật mật khẩu đăng nhập</p>
                  <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider" onClick={() => setShowPasswordModal(true)}>
                    Thay đổi →
                  </button>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <p className="text-sm font-bold text-white mb-1">Phiên đăng nhập</p>
                  <p className="text-xs text-slate-500 mb-4">Các phiên đang hoạt động trên thiết bị</p>
                  <div className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 inline-block">
                    1 phiên hiện hành (Thiết bị này)
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 p-5 bg-slate-800/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">Đổi mật khẩu</h2>
                <button onClick={() => setShowPasswordModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                {passError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">{passError}</div>}
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mật khẩu hiện tại</label>
                  <input required type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Mật khẩu mới</label>
                  <input required type="password" minLength={6} value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nhập lại mật khẩu mới</label>
                  <input required type="password" minLength={6} value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                </div>
                
                <div className="flex justify-end gap-3 pt-3">
                   <button type="button" onClick={() => setShowPasswordModal(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5">Hủy</button>
                   <button type="submit" disabled={changingPassword} className="px-5 py-2 rounded-xl bg-cyan-600 font-bold text-white hover:bg-cyan-500 shadow-lg disabled:opacity-50">
                     {changingPassword ? 'Đang cập nhật...' : 'Xác nhận'}
                   </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
