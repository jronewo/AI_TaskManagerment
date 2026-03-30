import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'

export default function Feed() {
  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8">
        <h1 className="text-xl font-bold text-white">Luồng trang chủ</h1>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          Hoạt động và thông báo (demo). Về{' '}
          <Link to="/" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
            bảng của tôi
          </Link>
          .
        </p>
      </div>
    </DashboardLayout>
  )
}
