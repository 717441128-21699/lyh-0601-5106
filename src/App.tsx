import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Dispatch from './pages/Dispatch'
import Charging from './pages/Charging'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import { useAuthStore } from './stores/useAuthStore'

function RequireAuth({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) {
  const { isLoggedIn, currentUser } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppLayout><Dashboard /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/dispatch"
          element={
            <RequireAuth allowedRoles={['dispatcher', 'manager', 'company']}>
              <AppLayout><Dispatch /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/charging"
          element={
            <RequireAuth allowedRoles={['dispatcher', 'manager', 'company']}>
              <AppLayout><Charging /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth allowedRoles={['manager', 'company']}>
              <AppLayout><Reports /></AppLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth allowedRoles={['company']}>
              <AppLayout><Settings /></AppLayout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
