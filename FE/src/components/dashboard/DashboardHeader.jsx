import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TaskGenieLogo } from '../TaskGenieLogo'
import {
  clearSession,
  getDisplayName,
  getEmailFromToken,
  getRole,
  getToken,
} from '../../lib/authStorage'

export function DashboardHeader({ onSessionChange }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const loggedIn = Boolean(getToken())
  const name = getDisplayName() || 'Khách'
  const email = getEmailFromToken() || ''
  const role = getRole() || ''

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

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

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-slate-950/40 px-3 backdrop-blur-xl sm:px-5">
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent" />

      <Link to="/" className="relative shrink-0">
        <TaskGenieLogo variant="aurora" className="[&_svg]:h-8 [&_svg]:w-8 [&_span]:text-lg" />
      </Link>

      <div className="relative mx-auto hidden max-w-lg flex-1 md:block">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Tìm bảng, thẻ, không gian…"
            className="w-full rounded-full border border-white/[0.08] bg-slate-900/70 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-cyan-500/30 focus:ring-2 focus:ring-cyan-500/20"
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      <div className="relative ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="hidden rounded-full bg-gradient-to-r from-cyan-500 to-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:brightness-110 sm:inline"
        >
          + Tạo mới
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-300"
          aria-label="Thông báo"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
          aria-label="Trợ giúp"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
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
                    {email ? (
                      <p className="truncate text-xs text-slate-400">{email}</p>
                    ) : null}
                    {role ? (
                      <p className="mt-1 text-xs text-slate-500">Vai trò: {role}</p>
                    ) : null}
                  </div>
                  <nav className="py-1 text-sm text-slate-300">
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-white/5"
                      onClick={(e) => e.preventDefault()}
                    >
                      Hồ sơ
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-white/5"
                      onClick={(e) => e.preventDefault()}
                    >
                      Hoạt động
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 hover:bg-white/5"
                      onClick={(e) => e.preventDefault()}
                    >
                      Cài đặt
                    </a>
                  </nav>
                  <div className="border-t border-white/10 pt-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/10"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-3">
                  <p className="mb-3 text-xs text-slate-400">
                    Đăng nhập để lưu bảng và đồng bộ.
                  </p>
                  <Link
                    to="/login"
                    className="block rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 py-2.5 text-center text-sm font-semibold text-slate-950"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="mt-2 block py-2 text-center text-sm text-cyan-400 hover:text-cyan-300"
                    onClick={() => setOpen(false)}
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
