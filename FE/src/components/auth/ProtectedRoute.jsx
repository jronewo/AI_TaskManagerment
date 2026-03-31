import { Navigate, Outlet } from 'react-router-dom'
import { getUserId, getRole } from '../../lib/authStorage'

export function ProtectedRoute() {
  const userId = getUserId()
  if (!userId) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export function AdminRoute() {
  const userId = getUserId()
  const role = getRole()
  if (!userId) {
    return <Navigate to="/login" replace />
  }
  if (role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
