import React, { useState } from 'react'
import { useChargingStore } from '../stores/useChargingStore'
import { useBusStore } from '../stores/useBusStore'
import { useAuthStore } from '../stores/useAuthStore'
import {
  Zap, BatteryCharging, AlertCircle, Wrench, CheckCircle,
  Play, Pause, MapPin, Navigation, Clock
} from 'lucide-react'
import type { ChargingPile, BusVehicle, WorkOrder, WorkOrderStatus } from '../types'
import { cn } from '../lib/utils'

const pileStatusColors: Record<string, string> = { idle: 'bg-green-500', charging: 'bg-blue-500', fault: 'bg-red-500' }
const pileStatusLabels: Record<string, string> = { idle: '空闲', charging: '充电中', fault: '故障' }
const pileBadgeStyles: Record<string, string> = {
  idle: 'bg-green-500/20 text-green-400 border-green-500/30',
  charging: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fault: 'bg-red-500/20 text-red-400 border-red-500/30',
}
const woColors: Record<WorkOrderStatus, string> = {
  pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
}
const woLabels: Record<WorkOrderStatus, string> = { pending: '待处理', in_progress: '处理中', completed: '已完成' }

const StatCard = ({ icon: Icon, value, label, borderColor }: {
  icon: React.ElementType; value: number; label: string; borderColor: string
}) => (
  <div className={cn('panel-card rounded-lg p-4 overflow-hidden', `border-b-4 ${borderColor}`)}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-3xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{label}</div>
      </div>
      <Icon className="w-10 h-10 text-gray-500" />
    </div>
  </div>
)

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
const calcDist = (a: [number, number, number], b: [number, number, number]) =>
  Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2).toFixed(1)

export default function Charging() {
  const { piles, workOrders, startCharging, stopCharging, reportFault, repairPile, findNearestIdlePile } = useChargingStore()
  const { buses } = useBusStore()
  const { currentUser } = useAuthStore()
  const [selectedBusByPile, setSelectedBusByPile] = useState<Record<string, string>>({})

  const isDispatcherPlus = !!currentUser && ['dispatcher', 'manager', 'company'].includes(currentUser.role)
  const lowBatteryBuses = buses.filter(b => b.batteryLevel < 0.3)
  const availableBuses = buses.filter(b => !b.chargingPileId)

  const handleStartCharging = (pileId: string) => {
    const busId = selectedBusByPile[pileId]
    if (busId) {
      startCharging(pileId, busId)
      const next = { ...selectedBusByPile }
      delete next[pileId]
      setSelectedBusByPile(next)
    }
  }

  const handleAcceptWorkOrder = (order: WorkOrder) => {
    const updated = useChargingStore.getState().workOrders.map(o =>
      o.id === order.id ? { ...o, status: 'in_progress' as const } : o
    )
    useChargingStore.setState({ workOrders: updated })
  }

  return (
    <div className="min-h-full bg-[#0a0e27] p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 grid grid-cols-4 gap-4">
          <StatCard icon={Zap} value={piles.length} label="充电桩总数" borderColor="border-cyan-500" />
          <StatCard icon={BatteryCharging} value={piles.filter(p => p.status === 'idle').length} label="空闲桩" borderColor="border-green-500" />
          <StatCard icon={Play} value={piles.filter(p => p.status === 'charging').length} label="充电中" borderColor="border-blue-500" />
          <StatCard icon={AlertCircle} value={piles.filter(p => p.status === 'fault').length} label="故障桩" borderColor="border-red-500" />
        </div>

        <div className="panel-card rounded-lg p-4 col-span-1">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">充电桩状态监控</h2>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {piles.map((pile: ChargingPile) => (
              <div key={pile.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn('w-3 h-3 rounded-full flex-shrink-0', pileStatusColors[pile.status], pile.status !== 'idle' && 'animate-pulse')} />
                  <span className="text-white font-medium flex-1">{pile.name}</span>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full border', pileBadgeStyles[pile.status])}>
                    {pileStatusLabels[pile.status]}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>利用率</span>
                    <span>{(pile.utilization * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${pile.utilization * 100}%` }} />
                  </div>
                </div>
                {pile.status === 'charging' && pile.currentBusId && (
                  <div className="text-xs text-blue-400 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />连接车辆: {pile.currentBusId}
                  </div>
                )}
                {pile.status === 'fault' && pile.faultType && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{pile.faultType}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">报修中</span>
                  </div>
                )}
                {isDispatcherPlus && (
                  <div className="flex gap-2">
                    {pile.status === 'idle' && (
                      <>
                        <select
                          className="flex-1 text-xs bg-white/10 text-white border border-white/10 rounded px-2 py-1.5 outline-none focus:border-cyan-500/50"
                          value={selectedBusByPile[pile.id] || ''}
                          onChange={(e) => setSelectedBusByPile({ ...selectedBusByPile, [pile.id]: e.target.value })}
                        >
                          <option value="">选择车辆</option>
                          {availableBuses.map(b => (
                            <option key={b.id} value={b.id}>{b.id} - {b.routeName}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleStartCharging(pile.id)}
                          disabled={!selectedBusByPile[pile.id]}
                          className="text-xs px-3 py-1.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />开始
                        </button>
                      </>
                    )}
                    {pile.status === 'charging' && (
                      <button
                        onClick={() => stopCharging(pile.id)}
                        className="flex-1 text-xs px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 flex items-center justify-center gap-1"
                      >
                        <Pause className="w-3 h-3" />停止充电
                      </button>
                    )}
                    {pile.status === 'fault' && (
                      <button
                        onClick={() => {
                          const hasOrder = workOrders.some(o => o.chargingPileId === pile.id && o.status !== 'completed')
                          if (!hasOrder) {
                            reportFault(pile.id, pile.faultType || '未知故障')
                          } else {
                            repairPile(pile.id)
                          }
                        }}
                        className="flex-1 text-xs px-3 py-1.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 flex items-center justify-center gap-1"
                      >
                        <Wrench className="w-3 h-3" />
                        {workOrders.some(o => o.chargingPileId === pile.id && o.status !== 'completed') ? '完成修复' : '报修'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card rounded-lg p-4 col-span-1">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
            <Navigation className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">低电量车辆引导</h2>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {lowBatteryBuses.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                <p>暂无低电量车辆</p>
              </div>
            ) : (
              lowBatteryBuses.map((bus: BusVehicle) => {
                const nearestPile = findNearestIdlePile(bus.position)
                const batColor = bus.batteryLevel < 0.15 ? 'bg-red-500' : 'bg-orange-500'
                const distance = nearestPile ? calcDist(bus.position, nearestPile.position) : '-'
                return (
                  <div key={bus.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{bus.routeName}</span>
                        <span className="text-xs text-gray-400">{bus.id}</span>
                      </div>
                      <Navigation className="w-4 h-4 text-green-400 animate-pulse" />
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>电量</span>
                        <span>{(bus.batteryLevel * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', batColor)} style={{ width: `${bus.batteryLevel * 100}%` }} />
                      </div>
                    </div>
                    {nearestPile ? (
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-1 text-cyan-400"><MapPin className="w-3 h-3" />{nearestPile.name}</div>
                        <div className="flex items-center gap-1 text-gray-400"><Clock className="w-3 h-3" />距离 {distance}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />暂无空闲充电桩
                      </div>
                    )}
                    {isDispatcherPlus && nearestPile && (
                      <button
                        onClick={() => startCharging(nearestPile.id, bus.id)}
                        className="w-full text-xs px-3 py-1.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />引导充电
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="panel-card rounded-lg p-4 col-span-2">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-500/20">
            <Wrench className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">维修工单</h2>
          </div>
          {workOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Wrench className="w-12 h-12 mx-auto mb-2 text-orange-500/30" />
              <p>暂无维修工单</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-left border-b border-white/10">
                    <th className="py-2 px-3 font-medium">工单号</th>
                    <th className="py-2 px-3 font-medium">充电桩</th>
                    <th className="py-2 px-3 font-medium">故障类型</th>
                    <th className="py-2 px-3 font-medium">状态</th>
                    <th className="py-2 px-3 font-medium">创建时间</th>
                    <th className="py-2 px-3 font-medium">负责人</th>
                    <th className="py-2 px-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((order: WorkOrder) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-3 text-cyan-400 font-mono text-xs">{order.id}</td>
                      <td className="py-3 px-3 text-white">{order.pileName}</td>
                      <td className="py-3 px-3 text-red-400">{order.faultType}</td>
                      <td className="py-3 px-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full border', woColors[order.status])}>
                          {woLabels[order.status]}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{fmtDate(order.createdAt)}</td>
                      <td className="py-3 px-3 text-gray-400">{order.assignee}</td>
                      <td className="py-3 px-3">
                        {isDispatcherPlus && order.status === 'pending' && (
                          <button onClick={() => handleAcceptWorkOrder(order)} className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30">
                            接单处理
                          </button>
                        )}
                        {isDispatcherPlus && order.status === 'in_progress' && (
                          <button onClick={() => repairPile(order.chargingPileId)} className="text-xs px-3 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />完成修复
                          </button>
                        )}
                        {order.status === 'completed' && <span className="text-xs text-gray-500">-</span>}
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
