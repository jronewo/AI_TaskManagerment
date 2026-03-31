import { Link } from 'react-router-dom'

/**
 * @param {{ title: string, colorClass: string, to?: string }} props
 */
export function BoardCard({ title, colorClass, to = '/board' }) {
  return (
    <Link to={to} className="group block w-[11.5rem] shrink-0 sm:w-52">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 shadow-lg shadow-black/30 ring-0 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-500/25 hover:shadow-cyan-500/10">
        <div className={`relative h-28 overflow-hidden ${colorClass}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent opacity-60" />
          <div className="absolute bottom-2 left-3 right-3 h-1 rounded-full bg-white/20 backdrop-blur-sm" />
        </div>
        <div className="border-t border-white/[0.06] px-3 py-3">
          <p className="truncate text-sm font-semibold text-slate-200 group-hover:text-white">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">Nhấn để mở</p>
        </div>
      </div>
    </Link>
  )
}

export function CreateBoardCard({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[8.75rem] w-[11.5rem] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-600/60 bg-slate-900/30 text-center text-sm font-medium text-slate-500 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-200 sm:w-52"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xl text-cyan-400">
        +
      </span>
      Tạo dự án mới
    </button>
  )
}

