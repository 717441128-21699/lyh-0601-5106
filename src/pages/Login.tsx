import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import type { UserRole } from '../types'
import { User, Shield, Building2, Briefcase, Camera, Check } from 'lucide-react'

const roles: { id: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'driver', label: '司机', description: '查看运营数据与车辆状态', icon: <User size={28} /> },
  { id: 'dispatcher', label: '调度员', description: '智能调度与车辆分配', icon: <Shield size={28} /> },
  { id: 'manager', label: '运营经理', description: '综合运营管理与报表', icon: <Briefcase size={28} /> },
  { id: 'company', label: '公交公司', description: '全平台管理与配置', icon: <Building2 size={28} /> },
]

const roleLabelMap: Record<UserRole, string> = {
  driver: '司机',
  dispatcher: '调度员',
  manager: '运营经理',
  company: '公交公司',
}

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const login = useAuthStore((s) => s.login)
  const loginLogs = useAuthStore((s) => s.loginLogs)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!selectedRole) return
    setIsScanning(true)
    await new Promise((r) => setTimeout(r, 1500))
    login(selectedRole)
    setIsScanning(false)
    navigate('/')
  }

  const recentLogs = [...loginLogs].reverse().slice(0, 5)

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1040 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-wider" style={{ color: '#00f0ff' }}>
            城市公交智能调度平台
          </h1>
          <p className="mt-3 text-gray-400 text-lg">City Bus Intelligent Dispatch Platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="panel-card p-8 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
              <Camera size={22} style={{ color: '#00f0ff' }} />
              人脸识别登录
            </h2>

            <div className="relative w-full h-72 rounded-xl overflow-hidden border-2 border-dashed flex items-center justify-center mb-6"
              style={{ borderColor: 'rgba(0,240,255,0.5)', background: 'rgba(0,240,255,0.03)' }}
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(0,240,255,0.1)' }}
                >
                  <Camera size={40} style={{ color: '#00f0ff' }} />
                </div>
                <p className="text-gray-300 text-sm">
                  {isScanning ? '正在识别...' : selectedRole ? '准备就绪，请面向摄像头' : '请先选择身份角色'}
                </p>
              </div>
              {isScanning && (
                <div className="scan-line absolute left-0 right-0 h-1"
                  style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }}
                />
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">选择身份角色</p>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const selected = selectedRole === role.id
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                        selected ? 'glow-cyan' : ''
                      }`}
                      style={{
                        background: selected ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.03)',
                        borderColor: selected ? '#00f0ff' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div style={{ color: selected ? '#00f0ff' : '#9ca3af' }}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${selected ? 'text-white' : 'text-gray-200'}`}>
                              {role.label}
                            </p>
                            {selected && <Check size={16} style={{ color: '#00f0ff' }} />}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedRole || isScanning}
              className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedRole && !isScanning
                  ? 'linear-gradient(90deg, #00f0ff, #00a3ff)'
                  : 'rgba(255,255,255,0.1)',
                color: '#0a0e27',
              }}
            >
              {isScanning ? '识别中...' : '人脸识别登录'}
            </button>
          </div>

          <div className="panel-card p-8 rounded-2xl">
            <h2 className="text-xl font-semibold mb-6 text-white">登录日志</h2>
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <User size={48} opacity={0.3} />
                <p className="mt-3 text-sm">暂无登录记录</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,240,255,0.1)' }}
                    >
                      <User size={18} style={{ color: '#00f0ff' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{log.userName}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}
                        >
                          {roleLabelMap[log.role]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <Check size={18} style={{ color: '#00ff88' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
