import { DashboardLayout } from '../layouts/DashboardLayout'

export function AdminLayout({ children }) {
  return (
    <DashboardLayout>
      <div className="border-b border-white/[0.06] bg-slate-950/20 px-5 py-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Admin Control Center
        </div>
      </div>
      {children}
    </DashboardLayout>
  )
}
