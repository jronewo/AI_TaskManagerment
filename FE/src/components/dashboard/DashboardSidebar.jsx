import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getRole, getIsOrgOwner } from '../../lib/authStorage'

const navCls = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 shadow-[inset_3px_0_0_0_rgba(34,211,238,0.85)]'
      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
  }`

export function DashboardSidebar() {
  const [wsOpen, setWsOpen] = useState(true)
  const navigate = useNavigate()
  const role = getRole()
  const isOrgOwner = getIsOrgOwner()

  if (role?.toLowerCase() === 'admin' || isOrgOwner) {
    return null
  }

  return (
    <aside className="hidden w-[15.5rem] shrink-0 flex-col rounded-2xl border border-white/[0.07] bg-slate-950/50 shadow-xl shadow-black/20 backdrop-blur-xl lg:flex">
      <nav className="flex flex-col gap-1 p-3">
        <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Menu
        </p>
        <NavLink to="/dashboard" end className={navCls}>
          <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Bảng của tôi
        </NavLink>
        <NavLink to="/templates" className={navCls}>
          <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          Mẫu có sẵn
        </NavLink>
        <NavLink to="/feed" className={navCls}>
          <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Luồng trang chủ
        </NavLink>

        <p className="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Cá nhân & Nhóm
        </p>
        <NavLink to="/profile" className={navCls}>
          <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Kỹ năng & Hồ sơ
        </NavLink>
        <NavLink to="/evaluations" className={navCls}>
          <svg className="h-5 w-5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Đánh giá năng lực
        </NavLink>
      </nav>

      <div className="mx-3 border-t border-white/[0.06] px-0 pt-3">
        <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Không gian
        </p>
        <button
          type="button"
          onClick={() => setWsOpen((v) => !v)}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left text-sm text-slate-300 transition hover:bg-white/[0.04]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-rose-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20">
            K
          </span>
          <span className="min-w-0 flex-1 truncate font-medium leading-tight">
            TaskGenie · không gian chính
          </span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-500 transition ${wsOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {wsOpen ? (
          <div className="ml-3 mt-1 space-y-0.5 border-l border-cyan-500/20 pl-3">
            <Link
              to="/dashboard"
              className="block rounded-lg py-2 text-sm text-slate-400 transition hover:text-cyan-300"
            >
              Mở bảng mới nhất
            </Link>
            <button
              type="button"
              onClick={() => navigate('/team-management')}
              className="flex w-full items-center gap-1 rounded-lg py-2 text-left text-sm text-slate-400 hover:text-slate-200"
            >
              Thành viên <span className="text-slate-600">+</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/org-management')}
              className="block w-full rounded-lg py-2 text-left text-sm text-slate-400 hover:text-slate-200"
            >
              Cài đặt không gian
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-auto p-3">
        <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 to-slate-950/90 p-3">
          <div className="flex items-start gap-2">
            <span className="text-xl leading-none">✨</span>
            <div>
              <p className="text-xs font-bold text-white">TaskGenie Plus</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                Tự động hóa nhẹ với AI (demo).
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-violet-400/30 bg-violet-500/10 py-2 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/20"
          >
            Khám phá
          </button>
        </div>
      </div>
    </aside>
  )
}
