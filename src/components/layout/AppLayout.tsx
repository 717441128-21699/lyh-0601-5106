import { Navigate, useLocation, useNavigate, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useBusStore } from '../../stores/useBusStore'
import type { UserRole } from '../../types'
import {
  LayoutDashboard,
  Sliders,
  Zap,
  FileSpreadsheet,
  LogOut,
  User,
  Bell,
  Settings,
} from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

const roleLabelMap: Record<UserRole, string> = {
  driver: '司机',
  dispatcher: '调度员',
  manager: '运营经理',
  company: '公交公司',
}

const navItems = [
  { path: '/dashboard', label: '3D态势总览', icon: <LayoutDashboard size={20} />, roles: ['driver', 'dispatcher', 'manager', 'company'] as UserRole[] },
  { path: '/dispatch', label: '智能调度', icon: <Sliders size={20} />, roles: ['dispatcher', 'manager', 'company'] as UserRole[] },
  { path: '/charging', label: '充电管理', icon: <Zap size={20} />, roles: ['dispatcher', 'manager', 'company'] as UserRole[] },
  { path: '/reports', label: '运营报表', icon: <FileSpreadsheet size={20} />, roles: ['manager', 'company'] as UserRole[] },
  { path: '/settings', label: '公司配置', icon: <Settings size={20} />, roles: ['company'] as UserRole[] },
]

const pageTitleMap: Record<string, string> = {
  '/dashboard': '3D态势总览',
  '/dispatch': '智能调度',
  '/charging': '充电管理',
  '/reports': '运营报表',
  '/settings': '公司配置',
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)
  const alerts = useBusStore((s) => s.alerts)
  const location = useLocation()
  const navigate = useNavigate()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  const userRole = currentUser?.role
  const visibleNavItems = navItems.filter((item) => userRole && item.roles.includes(userRole))
  const unreadAlertCount = alerts.filter((a) => !a.read).length
  const currentPageTitle = pageTitleMap[location.pathname] || '城市公交智能调度平台'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0a0e27' }}>
      <aside
        className="w-60 flex flex-col flex-shrink-0"
        style={{ background: '#0d1330', borderRight: '1px solid rgba(0,240,255,0.1)' }}
      >
        <div className="h-16 flex items-center justify-center border-b" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
          <h1 className="text-lg font-bold tracking-wider" style={{ color: '#00f0ff' }}>
            公交智能调度
          </h1>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(0,240,255,0.1)' : 'transparent',
                color: isActive ? '#00f0ff' : '#9ca3af',
              })}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="p-4 border-t"
          style={{ borderColor: 'rgba(0,240,255,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,240,255,0.1)' }}
            >
              <User size={18} style={{ color: '#00f0ff' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{roleLabelMap[userRole as UserRole]}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="h-16 flex items-center justify-between px-6 flex-shrink-0"
          style={{ background: 'rgba(13,19,48,0.8)', borderBottom: '1px solid rgba(0,240,255,0.1)' }}
        >
          <h2 className="text-xl font-semibold text-white">{currentPageTitle}</h2>

          <div className="flex items-center gap-4">
            <button
              className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <Bell size={20} style={{ color: '#9ca3af' }} />
              {unreadAlertCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#ff2d55', color: 'white' }}
                >
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,240,255,0.15)' }}
              >
                <User size={18} style={{ color: '#00f0ff' }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{roleLabelMap[userRole as UserRole]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/20"
                title="退出登录"
              >
                <LogOut size={18} style={{ color: '#ff2d55' }} />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6" style={{ background: '#0a0e27' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
