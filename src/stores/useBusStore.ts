import { create } from 'zustand'
import type { BusRoute, BusVehicle, BusStop, Alert, TimelineEvent } from '../types'
import { routes as initialRoutes, buses as initialBuses, stops as initialStops } from '../data/mock'

interface BusState {
  routes: BusRoute[]
  buses: BusVehicle[]
  stops: BusStop[]
  selectedBusId: string | null
  selectedRouteId: string | null
  alerts: Alert[]
  timeline: TimelineEvent[]
  simulationTime: number
  isSimulating: boolean
  selectBus: (id: string | null) => void
  selectRoute: (id: string | null) => void
  updateSimulation: (updates: Partial<Pick<BusState, 'isSimulating' | 'simulationTime'>>) => void
  addAlert: (alert: Alert) => void
  dismissAlert: (id: string) => void
  tickSimulation: () => void
}

export const useBusStore = create<BusState>()((set, get) => ({
  routes: initialRoutes,
  buses: initialBuses,
  stops: initialStops,
  selectedBusId: null,
  selectedRouteId: null,
  alerts: [],
  timeline: [],
  simulationTime: Date.now(),
  isSimulating: false,

  selectBus: (id) => set({ selectedBusId: id }),

  selectRoute: (id) => set({ selectedRouteId: id }),

  updateSimulation: (updates) => set((state) => ({ ...state, ...updates })),

  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),

  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id),
  })),

  tickSimulation: () => set((state) => {
    const newTime = state.simulationTime + 60000
    const newAlerts = [...state.alerts]

    const newRoutes = state.routes.map((route) => {
      let consecutiveHighLoad = route.consecutiveHighLoad
      const routeBuses = state.buses.filter((b) => b.routeId === route.id)
      const hasHighLoad = routeBuses.some((b) => b.passengerRate > 0.85)
      if (hasHighLoad) {
        consecutiveHighLoad++
      } else {
        consecutiveHighLoad = 0
      }
      return { ...route, consecutiveHighLoad }
    })

    const newBuses = state.buses.map((bus) => {
      const route = state.routes.find((r) => r.id === bus.routeId)
      if (!route || route.path.length < 2) return bus

      let progress = bus.progress + bus.speed * 0.002
      let currentStopIndex = bus.currentStopIndex
      let direction = bus.direction

      if (progress >= 1) {
        progress = 0
        if (direction === 'forward') {
          if (currentStopIndex < route.path.length - 1) {
            currentStopIndex++
          } else {
            direction = 'backward'
            currentStopIndex--
          }
        } else {
          if (currentStopIndex > 0) {
            currentStopIndex--
          } else {
            direction = 'forward'
            currentStopIndex++
          }
        }
      }

      const fromIdx = direction === 'forward'
        ? Math.max(0, currentStopIndex - 1)
        : Math.min(route.path.length - 1, currentStopIndex + 1)
      const from = route.path[fromIdx]
      const to = route.path[currentStopIndex]

      const position: [number, number, number] = [
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
        from[2] + (to[2] - from[2]) * progress,
      ]

      let passengerRate = bus.passengerRate + (Math.random() - 0.5) * 0.1
      passengerRate = Math.max(0, Math.min(1, passengerRate))

      let batteryLevel = bus.batteryLevel - 0.002
      batteryLevel = Math.max(0, Math.min(1, batteryLevel))

      if (passengerRate > 0.85) {
        const exists = newAlerts.find(
          (a) => a.busId === bus.id && a.type === 'high_load' && !a.read
        )
        if (!exists) {
          newAlerts.push({
            id: `alert-${Date.now()}-${bus.id}-hl`,
            type: 'high_load',
            title: '高负载预警',
            message: `${bus.routeName} 公交车 ${bus.id} 客载率 ${(passengerRate * 100).toFixed(1)}%`,
            routeId: bus.routeId,
            busId: bus.id,
            timestamp: new Date(newTime).toISOString(),
            read: false,
          })
        }
      }

      if (batteryLevel < 0.2) {
        const exists = newAlerts.find(
          (a) => a.busId === bus.id && a.type === 'low_battery' && !a.read
        )
        if (!exists) {
          newAlerts.push({
            id: `alert-${Date.now()}-${bus.id}-lb`,
            type: 'low_battery',
            title: '低电量预警',
            message: `${bus.routeName} 公交车 ${bus.id} 电量 ${(batteryLevel * 100).toFixed(1)}%`,
            routeId: bus.routeId,
            busId: bus.id,
            timestamp: new Date(newTime).toISOString(),
            read: false,
          })
        }
      }

      return {
        ...bus,
        position,
        currentStopIndex,
        direction,
        progress,
        passengerRate,
        batteryLevel,
      }
    })

    return {
      buses: newBuses,
      routes: newRoutes,
      alerts: newAlerts,
      simulationTime: newTime,
    }
  }),
}))
