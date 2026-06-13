import React, { useState, useEffect } from 'react'
import { useBusStore } from '../stores/useBusStore'
import { useDispatchStore } from '../stores/useDispatchStore'
import { useAuthStore } from '../stores/useAuthStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts'
import {
  TrendingUp,
  Clock,
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  ChevronRight,
  AlertTriangle,
  Car,
  UserCheck,
} from 'lucide-react'
import type { UserRole, ScheduleStatus, ApprovalLevel } from '../types'

const levelLabels: Record<ApprovalLevel, string> = {
  dispatcher: '调度员',
  manager: '运营经理',
  company: '公交公司',
}

const scheduleStatusColors: Record<ScheduleStatus, string> = {
  pending: '#f59e0b',
  departed: '#00f0ff',
  completed: '#00ff88',
}

export default function Dispatch() {
  const routes = useBusStore((s) => s.routes)
  const stops = useBusStore((s) => s.stops)
  const currentUser = useAuthStore((s) => s.currentUser)
  const {
    approvals,
    approve,
    reject,
    intervalBusSchemes,
    proposeIntervalScheme,
    activateIntervalScheme,
    cancelIntervalScheme,
    dispatchAdjustments,
    recalculateIntervals,
  } = useDispatchStore()

  const [passengerData, setPassengerData] = useState<any[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [approvalComments, setApprovalComments] = useState<Record<string, string>>({})

  useEffect(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const data = hours.map((hour) => {
      const point: any = { hour: `${hour}:00` }
      routes.forEach((route) => {
        let base = 40 + Math.random() * 60
        if ((hour >= 8 && hour <= 9) || (hour >= 17 && hour <= 18)) {
          base = 150 + Math.random() * 50
        } else if (hour >= 7 && hour <= 10) {
          base = 100 + Math.random() * 60
        } else if (hour >= 16 && hour <= 19) {
          base = 110 + Math.random() * 50
        } else if (hour >= 22 || hour <= 5) {
          base = 20 + Math.random() * 30
        }
        point[route.name] = Math.floor(base)
      })
      return point
    })
    setPassengerData(data)
  }, [routes])

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0]
  const nextSchedules = selectedRoute
    ? selectedRoute.schedule.filter((s) => s.status === 'pending').slice(0, 10)
    : []

  const recentAdjustments = dispatchAdjustments.slice(-5).reverse()

  const handleRecalculate = () => {
    recalculateIntervals(routes)
  }

  const handleApprove = (approvalId: string) => {
    if (!currentUser) return
    approve(
      approvalId,
      currentUser.id,
      currentUser.name,
      currentUser.role as ApprovalLevel,
      approvalComments[approvalId] || '',
    )
  }

  const handleReject = (approvalId: string) => {
    if (!currentUser) return
    reject(
      approvalId,
      currentUser.id,
      currentUser.name,
      currentUser.role as ApprovalLevel,
      approvalComments[approvalId] || '',
    )
  }

  const getApprovalStepStatus = (
    level: ApprovalLevel,
    currentLevel: ApprovalLevel,
    status: string,
    approvals: any[],
  ) => {
    const levels: ApprovalLevel[] = ['dispatcher', 'manager', 'company']
    const levelIdx = levels.indexOf(level)
    const currentIdx = levels.indexOf(currentLevel)

    if (approvals.find((a) => a.level === level && a.action === 'approved')) return 'approved'
    if (approvals.find((a) => a.level === level && a.action === 'rejected')) return 'rejected'
    if (status === 'approved') return 'approved'
    if (status === 'rejected') return 'rejected'
    if (level === currentLevel) return 'current'
    if (levelIdx < currentIdx) return 'approved'
    return 'pending'
  }

  const highLoadStops = stops.filter((s) => s.passengerCount > s.safetyThreshold * 0.9)

  const proposedSchemeRoutes = routes.filter((r) => {
    const routeStops = stops.filter((s) => r.stops.includes(s.id))
    return routeStops.some((s) => s.passengerCount > s.safetyThreshold * 0.85)
  })

  const handleProposeScheme = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId)
    if (!route) return
    const routeStops = route.stops
      .map((id) => stops.find((s) => s.id === id))
      .filter(Boolean) as typeof stops
    if (routeStops.length < 3) return
    const fromStop = routeStops[0]
    const toStop = routeStops[routeStops.length - 1]
    proposeIntervalScheme(route.id, route.name, fromStop.id, toStop.id, 2)
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="col-span-2 panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,240,255,0.15)' }}
            >
              <TrendingUp size={20} style={{ color: '#00f0ff' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">实时客流监控</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users size={14} />
            <span>24小时客流趋势</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={passengerData}>
            <defs>
              {routes.map((route) => (
                <linearGradient key={route.id} id={`grad-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={route.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={route.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: 'rgba(17,24,39,0.95)',
                border: '1px solid rgba(0,240,255,0.2)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }} />
            <ReferenceLine x="8:00" stroke="#ff6b35" strokeDasharray="5 5" label={{ value: '早高峰', fill: '#ff6b35', fontSize: 10 }} />
            <ReferenceLine x="18:00" stroke="#ff6b35" strokeDasharray="5 5" label={{ value: '晚高峰', fill: '#ff6b35', fontSize: 10 }} />
            {routes.map((route) => (
              <Area
                key={route.id}
                type="monotone"
                dataKey={route.name}
                stroke={route.color}
                fill={`url(#grad-${route.id})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,255,136,0.15)' }}
            >
              <Clock size={20} style={{ color: '#00ff88' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">自动排班系统</h3>
          </div>
          <button
            onClick={handleRecalculate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff' }}
          >
            <RefreshCw size={14} />
            重新计算
          </button>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">调度调整记录</p>
          <div className="space-y-2 max-h-28 overflow-y-auto">
            {recentAdjustments.length === 0 && (
              <p className="text-xs text-gray-500 py-2 text-center">暂无调整记录</p>
            )}
            {recentAdjustments.map((adj) => (
              <div
                key={adj.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{adj.routeName}</span>
                  <span className="text-xs text-gray-400">
                    {adj.oldInterval}分 → <span style={{ color: '#00ff88' }}>{adj.newInterval}分</span>
                  </span>
                </div>
                <span className="text-xs text-gray-500 truncate ml-2 max-w-[120px]">{adj.reason}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">当前发车间隔</p>
          <div className="flex flex-wrap gap-2">
            {routes.map((route) => {
              const hasRecentChange = recentAdjustments.some((a) => a.routeId === route.id)
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedRoute?.id === route.id ? 'ring-2' : ''
                  }`}
                  style={{
                    background: hasRecentChange ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
                    borderColor: route.color,
                    border: `1px solid ${hasRecentChange ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    color: 'white',
                    outline: selectedRoute?.id === route.id ? `2px solid ${route.color}` : 'none',
                    outlineOffset: '1px',
                  }}
                >
                  <span style={{ color: route.color }}>●</span>
                  {route.name}: {route.dispatchInterval}分
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">{selectedRoute?.name} 未来班次</p>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {nextSchedules.map((s, idx) => (
              <div
                key={s.id}
                className="flex-shrink-0 px-3 py-2 rounded-lg text-xs min-w-[70px] text-center"
                style={{
                  background: `${scheduleStatusColors[s.status]}15`,
                  border: `1px solid ${scheduleStatusColors[s.status]}40`,
                }}
              >
                <div className="font-medium" style={{ color: scheduleStatusColors[s.status] }}>
                  {new Date(s.departureTime).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="text-gray-400 mt-0.5">
                  {s.direction === 'forward' ? '→' : '←'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.15)' }}
            >
              <FileCheck size={20} style={{ color: '#f5a623' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">三级会签审批</h3>
          </div>
        </div>

        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {approvals.length === 0 && (
            <p className="text-sm text-gray-500 py-8 text-center">暂无待审批事项</p>
          )}
          {approvals.map((approval) => {
            const levels: ApprovalLevel[] = ['dispatcher', 'manager', 'company']
            const canAct =
              currentUser &&
              approval.status === 'pending' &&
              approval.currentLevel === (currentUser.role as ApprovalLevel)

            return (
              <div
                key={approval.id}
                className="rounded-lg p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{approval.routeName}</span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background:
                            approval.type === 'add_bus' ? 'rgba(0,240,255,0.15)' : 'rgba(245,166,35,0.15)',
                          color: approval.type === 'add_bus' ? '#00f0ff' : '#f5a623',
                        }}
                      >
                        {approval.type === 'add_bus' ? '加车申请' : '区间车'}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background:
                            approval.status === 'pending'
                              ? 'rgba(245,166,35,0.15)'
                              : approval.status === 'approved'
                              ? 'rgba(0,255,136,0.15)'
                              : 'rgba(255,45,85,0.15)',
                          color:
                            approval.status === 'pending'
                              ? '#f5a623'
                              : approval.status === 'approved'
                              ? '#00ff88'
                              : '#ff2d55',
                        }}
                      >
                        {approval.status === 'pending' ? '待审批' : approval.status === 'approved' ? '已通过' : '已拒绝'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{approval.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(approval.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {levels.map((level, idx) => {
                    const status = getApprovalStepStatus(
                      level,
                      approval.currentLevel,
                      approval.status,
                      approval.approvals,
                    )
                    const color =
                      status === 'approved'
                        ? '#00ff88'
                        : status === 'rejected'
                        ? '#ff2d55'
                        : status === 'current'
                        ? '#00f0ff'
                        : 'rgba(255,255,255,0.3)'
                    return (
                      <React.Fragment key={level}>
                        <div
                          className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-xs"
                          style={{ background: `${color}10`, border: `1px solid ${color}30` }}
                        >
                          {status === 'approved' ? (
                            <CheckCircle size={12} style={{ color }} />
                          ) : status === 'rejected' ? (
                            <XCircle size={12} style={{ color }} />
                          ) : status === 'current' ? (
                            <UserCheck size={12} style={{ color }} />
                          ) : (
                            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                          )}
                          <span style={{ color }}>{levelLabels[level]}</span>
                        </div>
                        {idx < levels.length - 1 && <ChevronRight size={12} className="text-gray-500" />}
                      </React.Fragment>
                    )
                  })}
                </div>

                {approval.approvals.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {approval.approvals.map((rec, idx) => (
                      <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                        <span
                          style={{
                            color: rec.action === 'approved' ? '#00ff88' : '#ff2d55',
                          }}
                        >
                          {rec.action === 'approved' ? '✓' : '✗'} {levelLabels[rec.level]} {rec.userName}
                        </span>
                        {rec.comment && <span className="text-gray-500">「{rec.comment}」</span>}
                      </div>
                    ))}
                  </div>
                )}

                {canAct && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="输入审批意见（可选）..."
                      value={approvalComments[approval.id] || ''}
                      onChange={(e) =>
                        setApprovalComments({ ...approvalComments, [approval.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                        style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
                      >
                        <CheckCircle size={16} /> 通过
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                        style={{ background: 'rgba(255,45,85,0.15)', color: '#ff2d55' }}
                      >
                        <XCircle size={16} /> 拒绝
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="col-span-2 panel-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(108,92,231,0.15)' }}
            >
              <Car size={20} style={{ color: '#6c5ce7' }} />
            </div>
            <h3 className="text-lg font-semibold text-white">区间车方案</h3>
          </div>
          <div className="flex items-center gap-2">
            {highLoadStops.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(255,107,53,0.1)', color: '#ff6b35' }}>
                <AlertTriangle size={14} />
                <span>{highLoadStops.length} 个站点接近满载阈值</span>
              </div>
            )}
          </div>
        </div>

        {proposedSchemeRoutes.length > 0 && intervalBusSchemes.filter(s => s.status !== 'cancelled').length === 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
            <p className="text-xs text-amber-400 mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> 智能建议：以下线路客流较高，建议启动区间车方案
            </p>
            <div className="flex flex-wrap gap-2">
              {proposedSchemeRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleProposeScheme(route.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: 'rgba(108,92,231,0.15)', color: '#6c5ce7' }}
                >
                  <Plus size={14} />
                  为 {route.name} 提出方案
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {intervalBusSchemes.filter(s => s.status !== 'cancelled').length === 0 && (
            <div className="col-span-2 py-8 text-center">
              <p className="text-sm text-gray-500">暂无区间车方案</p>
            </div>
          )}
          {intervalBusSchemes
            .filter((s) => s.status !== 'cancelled')
            .map((scheme) => {
              const fromStop = stops.find((s) => s.id === scheme.fromStopId)
              const toStop = stops.find((s) => s.id === scheme.toStopId)
              return (
                <div
                  key={scheme.id}
                  className="rounded-lg p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{scheme.routeName}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            background:
                              scheme.status === 'active'
                                ? 'rgba(0,255,136,0.15)'
                                : 'rgba(245,166,35,0.15)',
                            color: scheme.status === 'active' ? '#00ff88' : '#f5a623',
                          }}
                        >
                          {scheme.status === 'active' ? '运行中' : '已提议'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {fromStop?.name} → {toStop?.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        投入车辆：{scheme.busCount} 辆 · {new Date(scheme.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {scheme.status === 'proposed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => activateIntervalScheme(scheme.id)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
                      >
                        激活方案
                      </button>
                      <button
                        onClick={() => cancelIntervalScheme(scheme.id)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        取消
                      </button>
                    </div>
                  )}
                  {scheme.status === 'active' && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#00ff88' }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
                      <span>区间车运行中，正在缓解客流压力</span>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
