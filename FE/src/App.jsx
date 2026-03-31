import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BoardView from './pages/BoardView'
import Feed from './pages/Feed'
import Templates from './pages/Templates'
import AdminDashboard from './pages/AdminDashboard'
import Landing from './pages/Landing'
import OrgRegister from './pages/OrgRegister'
import OrgDashboard from './pages/OrgDashboard'
import TeamManagement from './pages/TeamManagement'
import UserProfile from './pages/UserProfile'
import UserEvaluations from './pages/UserEvaluations'
import TaskView from './pages/TaskView'
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/board/:projectId" element={<BoardView />} />
        <Route path="/task/:taskId" element={<TaskView />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/evaluations" element={<UserEvaluations />} />
        <Route path="/org-register" element={<OrgRegister />} />
        <Route path="/org-dashboard" element={<OrgDashboard />} />
        <Route path="/team-management" element={<TeamManagement />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
