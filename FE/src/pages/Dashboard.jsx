import { DashboardLayout } from '../layouts/DashboardLayout'
import { BoardCard, CreateBoardCard } from '../components/dashboard/BoardCard'

function SectionTitle({ icon, children, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-cyan-400">
          {icon}
        </span>
        {children}
      </h2>
      {subtitle ? (
        <p className="mt-1.5 pl-10 text-xs text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-5 sm:p-7 lg:p-8">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Xin chào 👋
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Bảng và không gian làm việc của bạn — tông tối, nhấn cyan và coral, bố cục riêng
            TaskGenie.
          </p>
        </div>

        <section className="mb-12">
          <SectionTitle
            subtitle="Truy cập nhanh các bảng bạn hay dùng"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          >
            Gần đây
          </SectionTitle>
          <div className="flex flex-wrap gap-4">
            <BoardCard title="BeeCyber" colorClass="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800" />
            <BoardCard
              title="SWD392 · Chill Computer"
              colorClass="bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-900"
            />
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
                  K
                </span>
                <h2 className="text-base font-semibold text-white">Không gian của bạn</h2>
              </div>
              <p className="mt-1 pl-11 text-xs text-slate-500">Quản lý bảng trong một chỗ</p>
            </div>
            <div className="flex flex-wrap gap-2 pl-11 sm:pl-0">
              <button
                type="button"
                className="rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/[0.12]"
              >
                Bảng
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              >
                Thành viên
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
              >
                Cài đặt
              </button>
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-violet-600/40 to-rose-600/40 px-3 py-1.5 text-xs font-semibold text-violet-200 ring-1 ring-violet-400/30 hover:from-violet-600/55 hover:to-rose-600/55"
              >
                Nâng cấp
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <BoardCard title="BeeCyber" colorClass="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800" />
            <CreateBoardCard />
          </div>
        </section>

        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-sm font-bold text-slate-300">
              T
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Không gian được chia sẻ</h2>
              <p className="text-xs text-slate-500">TaskGenie Workspace · demo</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <BoardCard
              title="SWD392 · Chill Computer"
              colorClass="bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-900"
            />
          </div>
        </section>

        <button
          type="button"
          className="w-full max-w-md rounded-xl border border-white/[0.08] bg-slate-900/40 py-3 text-sm text-slate-400 transition hover:border-slate-600 hover:bg-slate-900/70 hover:text-slate-200"
        >
          Xem bảng đã đóng
        </button>
      </div>
    </DashboardLayout>
  )
}
