import { useReducer } from 'react'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar'

export function DashboardLayout({ children }) {
  const [, bump] = useReducer((x) => x + 1, 0)

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#070a12] text-slate-300">
      <div
        className="pointer-events-none fixed inset-0 opacity-100"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(34,211,238,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_20%,rgba(251,113,133,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_0%_80%,rgba(167,139,250,0.08),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.3)_0%,transparent_35%,rgba(15,23,42,0.5)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-svh flex-col">
        <DashboardHeader onSessionChange={bump} />
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 pt-0 lg:flex-row lg:gap-4">
          <DashboardSidebar />
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-950/55 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl">
            <div className="max-h-[calc(100svh-3.5rem)] overflow-y-auto lg:max-h-[calc(100svh-5.5rem)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
