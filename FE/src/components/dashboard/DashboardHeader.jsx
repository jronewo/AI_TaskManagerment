import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TaskGenieLogo } from '../TaskGenieLogo'
import {
  clearSession,
  getDisplayName,
  getRole,
  getUserId,
} from '../../lib/authStorage'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications'
import { getUserInvitations, updateInvitationStatus } from '../../api/invitations'
import { useTheme } from '../../lib/ThemeContext'
import { useLang } from '../../lib/LanguageContext'

export function DashboardHeader({ onSessionChange }) {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { lang, switchLang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [invitations, setInvitations] = useState([])
  const [loadingNotif, setLoadingNotif] = useState(false)
  const [toasts, setToasts] = useState([])
  const menuRef = useRef(null)
  const notifRef = useRef(null)
  const prevUnreadRef = useRef(0)
  const loggedIn = Boolean(getUserId())
  const userId = getUserId()
  const name = getDisplayName() || 'Khách'
  const email = localStorage.getItem('taskgenie_email') || ''
  const role = getRole() || ''

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // Polling for unread count every 15 seconds
  useEffect(() => {
    if (!userId) return
    const fetchCount = async () => {
      try {
        const count = await getUnreadCount(userId)
        if (count > prevUnreadRef.current && prevUnreadRef.current >= 0) {
          // New notification arrived — show toast
          const diff = count - prevUnreadRef.current
          if (prevUnreadRef.current > 0) {
            addToast(`🔔 Bạn có ${diff} thông báo mới!`)
          }
        }
        prevUnreadRef.current = count
        setUnreadCount(count)
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 15000)
    return () => clearInterval(interval)
  }, [userId])

  // Fetch full notifications when panel opens
  useEffect(() => {
    if (showNotif && userId) {
      fetchAllNotifications()
    }
  }, [showNotif, userId])

  async function fetchAllNotifications() {
    setLoadingNotif(true)
    try {
      const [notifs, invites] = await Promise.all([
        getNotifications(userId),
        email ? getUserInvitations(email).catch(() => []) : Promise.resolve([])
      ])
      setNotifications(notifs)
      setInvitations(Array.isArray(invites) ? invites.filter(i => i.status === 'Pending') : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNotif(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  async function handleDeleteNotif(id) {
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.notificationId !== id))
    } catch {}
  }

  async function handleUpdateInvitation(id, status) {
    try {
      await updateInvitationStatus(id, status)
      setInvitations(prev => prev.filter(i => i.invitationId !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  function addToast(message) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  function initials() {
    if (!loggedIn) return '?'
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return (name.slice(0, 2) || 'TG').toUpperCase()
  }

  function logout() {
    clearSession()
    setOpen(false)
    onSessionChange?.()
    navigate('/login')
  }

  const totalNotifCount = unreadCount + invitations.length

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-slate-950/40 px-3 backdrop-blur-xl sm:px-5">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

        <Link to="/" className="relative shrink-0">
          <TaskGenieLogo variant="aurora" className="[&_svg]:h-8 [&_svg]:w-8 [&_span]:text-lg" />
        </Link>

        <div className="relative mx-auto hidden max-w-lg flex-1 md:block">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder={t('search')}
              className="w-full rounded-full border border-white/[0.08] bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/20"
              aria-label={t('search')}
            />
          </div>
        </div>

        <div className="relative ml-auto flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-amber-300"
            aria-label={theme === 'dark' ? t('light_mode') : t('dark_mode')}
            title={theme === 'dark' ? t('light_mode') : t('dark_mode')}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => switchLang(lang === 'vi' ? 'en' : 'vi')}
            className="rounded-full px-2 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-white/5 hover:text-white border border-white/10"
            title="Switch language"
          >
            {lang === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI'}
          </button>

          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotif(v => !v)}
              className="relative rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
              aria-label={t('notifications')}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {totalNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-950">
                  {totalNotifCount > 9 ? '9+' : totalNotifCount}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-white/10 bg-slate-900/95 py-4 px-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('notifications')}</p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="bg-rose-500 rounded-full px-2 py-0.5 text-[10px] text-white font-bold">{unreadCount} {t('new_notif')}</span>
                        <button onClick={handleMarkAllRead} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase">
                          {t('mark_all_read')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-2">
                  {loadingNotif ? (
                    <div className="text-center py-4 text-sm text-cyan-400">Đang tải...</div>
                  ) : (
                    <>
                      {/* Invitations */}
                      {invitations.map(inv => (
                        <div key={`inv-${inv.invitationId}`} className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                          <p className="text-sm text-slate-200 mb-1">
                            <strong>Lời mời tham gia nhóm</strong> — Team {inv.teamId}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleUpdateInvitation(inv.invitationId, 'Accepted')} className="flex-1 bg-emerald-600/20 text-emerald-400 text-xs font-bold py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-600/40">
                              Chấp nhận
                            </button>
                            <button onClick={() => handleUpdateInvitation(inv.invitationId, 'Declined')} className="flex-1 bg-rose-600/20 text-rose-400 text-xs font-bold py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-600/40">
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Notifications */}
                      {notifications.map(n => (
                        <div key={n.notificationId} className={`group p-3 rounded-xl border transition-all ${n.isRead ? 'bg-white/[0.02] border-white/5' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${n.isRead ? 'text-slate-400' : 'text-white'}`}>{n.title}</p>
                              {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                              <p className="text-[9px] text-slate-600 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}</p>
                            </div>
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.isRead && (
                                <button onClick={() => handleMarkRead(n.notificationId)} className="p-1 text-cyan-400 hover:text-cyan-300" title="Đánh dấu đã đọc">
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                              )}
                              <button onClick={() => handleDeleteNotif(n.notificationId)} className="p-1 text-slate-500 hover:text-rose-400" title="Xoá">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {notifications.length === 0 && invitations.length === 0 && (
                        <div className="text-center py-6">
                          <div className="text-2xl mb-2 opacity-30">🔔</div>
                          <p className="text-xs text-slate-500 italic">{t('no_notifications')}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.open('https://github.com', '_blank')}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
            aria-label="Trợ giúp"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-rose-500 text-xs font-bold text-white shadow-md ring-2 ring-white/10"
              aria-expanded={open}
              aria-haspopup="true"
            >
              {initials()}
            </button>
            {open ? (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-white/10 bg-slate-900/95 py-2 shadow-2xl shadow-black/50 ring-1 ring-cyan-500/10 backdrop-blur-xl">
                {loggedIn ? (
                  <>
                    <div className="border-b border-white/10 px-4 pb-3 pt-2">
                      <p className="truncate text-sm font-semibold text-white">{name}</p>
                      {email ? <p className="truncate text-xs text-slate-400">{email}</p> : null}
                      {role ? <p className="mt-1 text-xs text-slate-500">{t('role')}: {role}</p> : null}
                    </div>
                    <nav className="py-1 text-sm text-slate-300">
                      {role?.toLowerCase() === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-cyan-400 hover:bg-white/5 font-bold" onClick={() => setOpen(false)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Quản trị viên
                        </Link>
                      )}
                      {(role?.toLowerCase() === 'organization_hr' || localStorage.getItem('taskgenie_isOrgOwner') === 'true') && (
                        <Link to="/org-dashboard" className="flex items-center gap-3 px-4 py-2 text-violet-400 hover:bg-white/5 font-bold" onClick={() => setOpen(false)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          Không gian Tổ chức
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>
                        <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        {t('profile')}
                      </Link>
                      <Link to="/feed" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>
                        <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        {t('activity')}
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>
                        <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('settings')}
                      </Link>
                    </nav>
                    <div className="border-t border-white/10 pt-1">
                      <button type="button" onClick={logout} className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/10 flex items-center gap-3">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        {t('logout')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3">
                    <p className="mb-3 text-xs text-slate-400">Đăng nhập để lưu bảng và đồng bộ.</p>
                    <Link to="/login" className="block rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 py-2.5 text-center text-sm font-semibold text-slate-950" onClick={() => setOpen(false)}>
                      {t('login')}
                    </Link>
                    <Link to="/register" className="mt-2 block py-2 text-center text-sm text-cyan-400 hover:text-cyan-300" onClick={() => setOpen(false)}>
                      {t('register')}
                    </Link>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Toast Notifications */}
      <div className="fixed top-16 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-enter pointer-events-auto rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 px-4 py-3 text-sm font-medium text-white shadow-2xl shadow-cyan-900/30 border border-white/20 backdrop-blur-xl max-w-xs">
            {toast.message}
          </div>
        ))}
      </div>
    </>
  )
}
