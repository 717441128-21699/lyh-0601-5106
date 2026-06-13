import { useAuthStore } from '../stores/useAuthStore'
import { Building2, User, Clock, Shield, FileText } from 'lucide-react'

const roleLabelMap: Record<string, string> = {
  driver: '司机',
  dispatcher: '调度员',
  manager: '运营经理',
  company: '公交公司',
}

export default function Settings() {
  const { loginLogs } = useAuthStore()

  return (
    <div className="min-h-full bg-[#0a0e27] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
            <Building2 size={24} style={{ color: '#00f0ff' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">公司配置</h1>
            <p className="text-gray-400 text-sm">平台系统配置与运营日志</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
                <User size={20} style={{ color: '#00f0ff' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5</div>
                <div className="text-xs text-gray-400">系统用户数</div>
              </div>
            </div>
          </div>
          <div className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.1)' }}>
                <Clock size={20} style={{ color: '#00ff88' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{loginLogs.length}</div>
                <div className="text-xs text-gray-400">登录日志条数</div>
              </div>
            </div>
          </div>
          <div className="panel-card rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.1)' }}>
                <Shield size={20} style={{ color: '#ff6b35' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-xs text-gray-400">权限角色</div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
            <FileText size={20} style={{ color: '#00f0ff' }} />
            <h2 className="text-lg font-semibold text-white">登录日志</h2>
          </div>

          {loginLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无登录记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-white/5">
                    <th className="py-3 px-4 font-medium">序号</th>
                    <th className="py-3 px-4 font-medium">用户</th>
                    <th className="py-3 px-4 font-medium">角色</th>
                    <th className="py-3 px-4 font-medium">登录时间</th>
                  </tr>
                </thead>
                <tbody>
                  {[...loginLogs].reverse().map((log, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-gray-400 text-sm">{loginLogs.length - idx}</td>
                      <td className="py-3 px-4 text-white text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
                            <User size={14} style={{ color: '#00f0ff' }} />
                          </div>
                          {log.userName}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(0,240,255,0.15)', color: '#00f0ff' }}>
                          {roleLabelMap[log.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm font-mono">
                        {new Date(log.timestamp).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
