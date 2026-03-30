import { Link } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'

export default function Templates() {
  return (
    <DashboardLayout>
      <div className="p-6 sm:p-8">
        <h1 className="text-xl font-bold text-white">Mẫu có sẵn</h1>
        <p className="mt-2 text-sm text-slate-400">
          Thư viện mẫu (demo).{' '}
          <Link to="/" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
            Về trang bảng
          </Link>
        </p>
      </div>
    </DashboardLayout>
  )
}
