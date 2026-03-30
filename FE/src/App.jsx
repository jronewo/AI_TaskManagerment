import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BoardView from './pages/BoardView'
import Feed from './pages/Feed'
import Templates from './pages/Templates'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/board" element={<BoardView />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
