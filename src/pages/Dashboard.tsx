import { useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CityGround from '../components/three/CityGround'
import RouteLine from '../components/three/RouteLine'
import BusStopMarker from '../components/three/BusStopMarker'
import BusVehicle3D from '../components/three/BusVehicle3D'
import ChargingPile3D from '../components/three/ChargingPile3D'
import GuidePath from '../components/three/GuidePath'
import HeatmapOverlay from '../components/three/HeatmapOverlay'
import { useBusStore } from '../stores/useBusStore'
import { useChargingStore } from '../stores/useChargingStore'
import { useDispatchStore } from '../stores/useDispatchStore'
import { useAuthStore } from '../stores/useAuthStore'
import {
  Play,
  Pause,
  AlertTriangle,
  BatteryLow,
  Users,
  Plus,
  X,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react'
import type { Alert, BusVehicle } from '../types'

export default function Dashboard() {
  const {
    routes,
    buses,
    stops,
    selectedBusId,
    selectedRouteId,
    alerts,
    simulationTime,
    isSimulating,
    selectBus,
    selectRoute,
    updateSimulation,
    dismissAlert,
    tickSimulation,
  } = useBusStore()

  const { piles, findNearestIdlePile } = useChargingStore()
  const { dispatchAdjustments, createApproval } = useDispatchStore()
  const { currentUser } = useAuthStore()

  useEffect(() => {
    if (!isSimulating) return
    const interval = setInterval(() => {
      tickSimulation()
    }, 1000)
    return () => clearInterval(interval)
  }, [isSimulating, tickSimulation])

  const routeColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    routes.forEach((r) => {
      map[r.id] = r.color
    })
    return map
  }, [routes])

  const selectedBus = useMemo(
    () => buses.find((b) => b.id === selectedBusId) || null,
    [buses, selectedBusId]
  )

  const selectedBusRouteColor = selectedBus
    ? routeColorMap[selectedBus.routeId] || '#4dabf7'
    : '#4dabf7'

  const lowBatteryBuses = useMemo(
    () => buses.filter((b) => b.batteryLevel < 0.2),
    [buses]
  )

  const hasFlowThresholdAlert = alerts.some((a) => a.type === 'flow_threshold')
  const highLoadBuses = buses.filter((b) => b.passengerRate > 0.85)

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'high_load':
        return <Users className="w-4 h-4" />
      case 'low_battery':
        return <BatteryLow className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const isHighPriority = (type: Alert['type']) =>
    type === 'high_load' || type === 'low_battery'

  const handleAddBus = (bus: BusVehicle) => {
    createApproval(
      'add_bus',
      bus.routeId,
      bus.routeName,
      `${bus.routeName} 客载率 ${(bus.passengerRate * 100).toFixed(1)}%，需要加车支援`
    )
  }

  const parseDepartureMinutes = (isoTime: string) => {
    const d = new Date(isoTime)
    return d.getHours() * 60 + d.getMinutes()
  }

  const getLoadColor = (rate: number) => {
    if (rate < 0.6) return 'bg-emerald-500'
    if (rate < 0.85) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getLoadBorder = (rate: number) => {
    if (rate < 0.6) return 'border-emerald-400'
    if (rate < 0.85) return 'border-yellow-400'
    return 'border-red-400'
  }

  return (
    <div className="flex flex-col h-screen bg-[#050810] text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 55, 60]} fov={55} />
            <OrbitControls
              enableDamping
              target={[0, 0, 10]}
              minDistance={20}
              maxDistance={120}
            />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[30, 50, 20]}
              intensity={0.8}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <CityGround />
            <HeatmapOverlay stops={stops} />
            {routes.map((route) => (
              <RouteLine
                key={route.id}
                points={route.path}
                color={route.color}
                highlighted={selectedRouteId === route.id}
              />
            ))}
            {stops.map((stop) => (
              <BusStopMarker key={stop.id} stop={stop} />
            ))}
            {buses.map((bus) => (
              <BusVehicle3D
                key={bus.id}
                bus={bus}
                routeColor={routeColorMap[bus.routeId] || '#4dabf7'}
                selected={selectedBusId === bus.id}
                onClick={() => selectBus(bus.id)}
              />
            ))}
            {piles.map((pile) => (
              <ChargingPile3D key={pile.id} pile={pile} />
            ))}
            {lowBatteryBuses.map((bus) => {
              const pile = findNearestIdlePile(bus.position)
              if (!pile) return null
              return (
                <GuidePath
                  key={`guide-${bus.id}`}
                  from={bus.position}
                  to={pile.position}
                />
              )
            })}
            <EffectComposer>
              <Bloom
                intensity={0.6}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
              />
            </EffectComposer>
          </Canvas>

          <div className="absolute top-4 left-4 z-10">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg px-4 py-3 border border-cyan-500/30">
              <div className="text-cyan-400 text-lg font-bold tracking-wider">
                3D态势总览
              </div>
              <div className="text-gray-400 text-xs mt-1">
                智能公交调度系统 · {currentUser?.name || '未登录'}
              </div>
            </div>
          </div>
        </div>

        <div className="w-80 bg-gray-900/80 backdrop-blur-md p-4 overflow-y-auto border-l border-cyan-500/20 flex flex-col gap-4">
          {hasFlowThresholdAlert && (
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/30">
              <Zap className="w-4 h-4" />
              区间车方案建议
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {highLoadBuses.length > 0 && (
            <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3">
              <div className="text-red-400 text-sm font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                加车申请
              </div>
              {highLoadBuses.slice(0, 2).map((bus) => (
                <div
                  key={bus.id}
                  className="flex items-center justify-between bg-gray-800/60 rounded p-2 mb-2 last:mb-0"
                >
                  <div>
                    <div className="text-sm font-medium">{bus.routeName}</div>
                    <div className="text-xs text-red-400">
                      客载率 {(bus.passengerRate * 100).toFixed(0)}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBus(bus)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    提交
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/20">
            <div className="text-xs text-gray-400 mb-2">仿真控制</div>
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  updateSimulation({ isSimulating: !isSimulating })
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  isSimulating
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                {isSimulating ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isSimulating ? '暂停' : '开始'}
              </button>
              <div className="text-right">
                <div className="text-cyan-400 font-mono text-lg">
                  {formatTime(simulationTime)}
                </div>
                <div className="text-[10px] text-gray-500">仿真时间</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              告警 ({alerts.length})
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {alerts.length === 0 && (
                <div className="text-gray-500 text-xs text-center py-4">
                  暂无告警
                </div>
              )}
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg p-2 border ${
                    isHighPriority(alert.type)
                      ? 'bg-red-900/40 border-red-500/40'
                      : 'bg-gray-800/50 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div
                        className={`p-1 rounded ${
                          isHighPriority(alert.type)
                            ? 'bg-red-500/30 text-red-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {alert.title}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {alert.message}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBus && (
            <div className="bg-gray-800/50 rounded-lg p-3 border border-cyan-500/30">
              <div className="text-xs text-gray-400 mb-2">选中车辆</div>
              <div className="text-lg font-bold mb-3" style={{ color: selectedBusRouteColor }}>
                {selectedBus.routeName}
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">客载率</span>
                    <span
                      className={
                        selectedBus.passengerRate > 0.85
                          ? 'text-red-400 font-bold'
                          : 'text-emerald-400'
                      }
                    >
                      {(selectedBus.passengerRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedBus.passengerRate > 0.85
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedBus.passengerRate * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">电量</span>
                    <span
                      className={
                        selectedBus.batteryLevel < 0.2
                          ? 'text-yellow-400 font-bold'
                          : 'text-cyan-400'
                      }
                    >
                      {(selectedBus.batteryLevel * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedBus.batteryLevel < 0.2
                          ? 'bg-yellow-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${selectedBus.batteryLevel * 100}%` }}
                    />
                  </div>
                </div>
                {selectedBus.passengerRate > 0.85 && (
                  <button
                    onClick={() => handleAddBus(selectedBus)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    申请加车
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-gray-400 mb-2">线路列表</div>
            <div className="flex flex-col gap-2">
              {routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() =>
                    selectRoute(selectedRouteId === route.id ? null : route.id)
                  }
                  className={`bg-gray-800/50 rounded-lg p-2 cursor-pointer transition-all border ${
                    selectedRouteId === route.id
                      ? 'border-cyan-500/60 bg-cyan-900/20'
                      : 'border-transparent hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="text-sm font-medium">{route.name}</span>
                      {route.consecutiveHighLoad > 0 && (
                        <span className="bg-red-500/30 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                          高载x{route.consecutiveHighLoad}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500">
                      {route.dispatchInterval}min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="h-36 bg-gray-900/80 backdrop-blur-md border-t border-cyan-500/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">
            3D时间轴 - 排班调度
          </span>
        </div>
        <div className="relative overflow-x-auto overflow-y-hidden h-24">
          <div className="relative" style={{ width: `${routes.length > 0 ? 1500 : 100}px`, minWidth: '100%' }}>
            {routes.map((route, routeIdx) => (
              <div
                key={route.id}
                className="flex items-center gap-2 h-7 mb-1"
                style={{ position: 'relative' }}
              >
                <div
                  className="w-2 h-5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: route.color }}
                />
                <div className="w-20 flex-shrink-0 text-[10px] text-gray-400 truncate">
                  {route.name}
                </div>
                <div className="relative flex-1 h-6">
                  {route.schedule.slice(0, 24).map((sched) => {
                    const minutes = parseDepartureMinutes(sched.departureTime)
                    const leftPct = (minutes / (24 * 60)) * 100
                    return (
                      <div
                        key={sched.id}
                        className={`absolute top-0 w-12 h-6 rounded border ${getLoadColor(
                          sched.loadRate
                        )} ${getLoadBorder(sched.loadRate)} opacity-80`}
                        style={{ left: `${leftPct}%` }}
                        title={`${sched.departureTime} - 载客率 ${(sched.loadRate * 100).toFixed(0)}%`}
                      />
                    )
                  })}
                  {dispatchAdjustments
                    .filter((adj) => adj.routeId === route.id)
                    .map((adj) => {
                      const minutes = parseDepartureMinutes(
                        new Date(adj.timestamp).toTimeString().slice(0, 5)
                      )
                      const leftPct = (minutes / (24 * 60)) * 100
                      return (
                        <div
                          key={adj.id}
                          className="absolute top-0 bottom-0 w-0.5 bg-fuchsia-500 z-10"
                          style={{ left: `${leftPct}%` }}
                          title={`${adj.reason} (${adj.oldInterval}→${adj.newInterval}min)`}
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-fuchsia-500 rounded-full" />
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
