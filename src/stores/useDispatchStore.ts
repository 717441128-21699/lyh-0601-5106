import { create } from 'zustand'
import type {
  ApprovalRequest,
  ApprovalLevel,
  ApprovalAction,
  ApprovalType,
  BusRoute,
  BusStop,
  IntervalBusTriggerRecord,
} from '../types'
import { initialApprovals } from '../data/mock'
import { useBusStore } from './useBusStore'

type IntervalBusSchemeStatus = 'proposed' | 'active' | 'cancelled'

interface IntervalBusScheme {
  id: string
  routeId: string
  routeName: string
  fromStopId: string
  toStopId: string
  status: IntervalBusSchemeStatus
  createdAt: string
  busCount: number
}

interface DispatchAdjustment {
  id: string
  routeId: string
  routeName: string
  oldInterval: number
  newInterval: number
  timestamp: string
  reason: string
}

interface DispatchState {
  approvals: ApprovalRequest[]
  intervalBusSchemes: IntervalBusScheme[]
  dispatchAdjustments: DispatchAdjustment[]
  intervalBusTriggers: IntervalBusTriggerRecord[]
  approve: (
    approvalId: string,
    userId: string,
    userName: string,
    role: ApprovalLevel,
    comment?: string,
  ) => void
  reject: (
    approvalId: string,
    userId: string,
    userName: string,
    role: ApprovalLevel,
    comment?: string,
  ) => void
  createApproval: (
    type: ApprovalType,
    routeId: string,
    routeName: string,
    reason: string,
  ) => void
  proposeIntervalScheme: (
    routeId: string,
    routeName: string,
    fromStopId: string,
    toStopId: string,
    busCount: number,
  ) => void
  activateIntervalScheme: (schemeId: string) => void
  cancelIntervalScheme: (schemeId: string) => void
  adjustDispatchInterval: (
    routeId: string,
    routeName: string,
    oldInterval: number,
    newInterval: number,
    reason: string,
  ) => void
  recalculateIntervals: (routes: BusRoute[]) => DispatchAdjustment[]
  checkAndTriggerIntervalBuses: (routes: BusRoute[], stops: BusStop[]) => IntervalBusTriggerRecord[]
}

const approvalLevels: ApprovalLevel[] = ['dispatcher', 'manager', 'company']

function getNextLevel(current: ApprovalLevel): ApprovalLevel | null {
  const idx = approvalLevels.indexOf(current)
  if (idx < 0 || idx >= approvalLevels.length - 1) return null
  return approvalLevels[idx + 1]
}

export const useDispatchStore = create<DispatchState>()((set, get) => ({
  approvals: initialApprovals,
  intervalBusSchemes: [],
  dispatchAdjustments: [],
  intervalBusTriggers: [],

  approve: (approvalId, userId, userName, role, comment = '') => {
    set((state) => ({
      approvals: state.approvals.map((appr) => {
        if (appr.id !== approvalId || appr.status !== 'pending') return appr
        if (appr.currentLevel !== role) return appr

        const record = {
          level: role,
          userId,
          userName,
          action: 'approved' as ApprovalAction,
          comment,
          timestamp: new Date().toISOString(),
        }

        const nextLevel = getNextLevel(role)
        if (nextLevel) {
          return {
            ...appr,
            currentLevel: nextLevel,
            approvals: [...appr.approvals, record],
          }
        }

        return {
          ...appr,
          status: 'approved' as const,
          approvals: [...appr.approvals, record],
        }
      }),
    }))
  },

  reject: (approvalId, userId, userName, role, comment = '') => {
    set((state) => ({
      approvals: state.approvals.map((appr) => {
        if (appr.id !== approvalId || appr.status !== 'pending') return appr
        if (appr.currentLevel !== role) return appr

        const record = {
          level: role,
          userId,
          userName,
          action: 'rejected' as ApprovalAction,
          comment,
          timestamp: new Date().toISOString(),
        }

        return {
          ...appr,
          status: 'rejected' as const,
          approvals: [...appr.approvals, record],
        }
      }),
    }))
  },

  createApproval: (type, routeId, routeName, reason) => {
    const exists = get().approvals.find(
      (a) => a.routeId === routeId && a.type === type && a.status === 'pending',
    )
    if (exists) return

    const newApproval: ApprovalRequest = {
      id: `appr-${Date.now()}-${routeId}`,
      type,
      routeId,
      routeName,
      reason,
      currentLevel: 'dispatcher',
      approvals: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ approvals: [...state.approvals, newApproval] }))
  },

  proposeIntervalScheme: (routeId, routeName, fromStopId, toStopId, busCount) => {
    const existingScheme = get().intervalBusSchemes.find(
      (s) => s.routeId === routeId && s.status !== 'cancelled',
    )
    if (existingScheme) return
    const scheme: IntervalBusScheme = {
      id: `scheme-${Date.now()}-${routeId}`,
      routeId,
      routeName,
      fromStopId,
      toStopId,
      status: 'proposed',
      createdAt: new Date().toISOString(),
      busCount,
    }
    const trigger: IntervalBusTriggerRecord = {
      id: `trigger-${Date.now()}-${routeId}`,
      routeId,
      routeName,
      fromStopId,
      toStopId,
      triggeredAt: new Date().toISOString(),
      status: 'proposed',
    }
    set((state) => ({
      intervalBusSchemes: [...state.intervalBusSchemes, scheme],
      intervalBusTriggers: [...state.intervalBusTriggers, trigger],
    }))
  },

  activateIntervalScheme: (schemeId) => {
    set((state) => {
      const scheme = state.intervalBusSchemes.find((s) => s.id === schemeId)
      return {
        intervalBusSchemes: state.intervalBusSchemes.map((s) =>
          s.id === schemeId ? { ...s, status: 'active' as const } : s,
        ),
        intervalBusTriggers: scheme
          ? state.intervalBusTriggers.map((t) =>
              t.routeId === scheme.routeId && t.status !== 'cancelled'
                ? { ...t, status: 'active' as const }
                : t,
            )
          : state.intervalBusTriggers,
      }
    })
  },

  cancelIntervalScheme: (schemeId) => {
    set((state) => {
      const scheme = state.intervalBusSchemes.find((s) => s.id === schemeId)
      return {
        intervalBusSchemes: state.intervalBusSchemes.map((s) =>
          s.id === schemeId ? { ...s, status: 'cancelled' as const } : s,
        ),
        intervalBusTriggers: scheme
          ? state.intervalBusTriggers.map((t) =>
              t.routeId === scheme.routeId && t.status !== 'active'
                ? { ...t, status: 'cancelled' as const }
                : t,
            )
          : state.intervalBusTriggers,
      }
    })
  },

  adjustDispatchInterval: (routeId, routeName, oldInterval, newInterval, reason) => {
    if (oldInterval === newInterval) return
    const adjustment: DispatchAdjustment = {
      id: `adj-${Date.now()}-${routeId}`,
      routeId,
      routeName,
      oldInterval,
      newInterval,
      timestamp: new Date().toISOString(),
      reason,
    }
    set((state) => ({ dispatchAdjustments: [...state.dispatchAdjustments, adjustment] }))
  },

  recalculateIntervals: (routes) => {
    const adjustments: DispatchAdjustment[] = []
    const now = Date.now()
    const hour = new Date(now).getHours()
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)

    routes.forEach((route) => {
      const routeBuses = route.schedule
      if (routeBuses.length === 0) return

      const avgLoadRate =
        routeBuses.reduce((sum, s) => sum + s.loadRate, 0) / routeBuses.length

      let newInterval = route.dispatchInterval

      if (avgLoadRate > 0.85) {
        newInterval = Math.max(3, Math.floor(route.dispatchInterval * 0.7))
      } else if (avgLoadRate > 0.7) {
        newInterval = Math.max(4, Math.floor(route.dispatchInterval * 0.85))
      } else if (avgLoadRate < 0.25) {
        newInterval = Math.min(20, Math.floor(route.dispatchInterval * 1.4))
      } else if (avgLoadRate < 0.4) {
        newInterval = Math.min(18, Math.floor(route.dispatchInterval * 1.2))
      }

      if (isPeak && avgLoadRate > 0.6) {
        newInterval = Math.max(3, Math.floor(newInterval * 0.85))
      }

      if (newInterval !== route.dispatchInterval) {
        const adjustment: DispatchAdjustment = {
          id: `adj-${now}-${route.id}`,
          routeId: route.id,
          routeName: route.name,
          oldInterval: route.dispatchInterval,
          newInterval,
          timestamp: new Date(now).toISOString(),
          reason: `自动调整: 平均载客率${(avgLoadRate * 100).toFixed(1)}%, ${isPeak ? '高峰时段' : '平峰时段'}`,
        }
        adjustments.push(adjustment)
      }
    })

    if (adjustments.length > 0) {
      set((state) => ({
        dispatchAdjustments: [...state.dispatchAdjustments, ...adjustments],
      }))
      adjustments.forEach((adj) => {
        useBusStore.getState().updateRouteInterval(adj.routeId, adj.newInterval)
      })
    }

    return adjustments
  },

  checkAndTriggerIntervalBuses: (routes, stops) => {
    const triggered: IntervalBusTriggerRecord[] = []
    const state = get()

    routes.forEach((route) => {
      const routeStops = route.stops
        .map((id) => stops.find((s) => s.id === id))
        .filter(Boolean) as BusStop[]
      if (routeStops.length < 3) return

      const overThreshold = routeStops.some(
        (s) => s.passengerCount > s.safetyThreshold * 0.9,
      )
      const hasExisting = state.intervalBusSchemes.some(
        (s) => s.routeId === route.id && s.status !== 'cancelled',
      )
      if (overThreshold && !hasExisting) {
        const fromStop = routeStops[0]
        const toStop = routeStops[routeStops.length - 1]

        const scheme: IntervalBusScheme = {
          id: `scheme-auto-${Date.now()}-${route.id}`,
          routeId: route.id,
          routeName: route.name,
          fromStopId: fromStop.id,
          toStopId: toStop.id,
          status: 'proposed',
          createdAt: new Date().toISOString(),
          busCount: 2,
        }
        const trigger: IntervalBusTriggerRecord = {
          id: `trigger-${Date.now()}-${route.id}`,
          routeId: route.id,
          routeName: route.name,
          fromStopId: fromStop.id,
          toStopId: toStop.id,
          triggeredAt: new Date().toISOString(),
          status: 'proposed',
        }
        triggered.push(trigger)
        set((s) => ({
          intervalBusSchemes: [...s.intervalBusSchemes, scheme],
          intervalBusTriggers: [...s.intervalBusTriggers, trigger],
        }))

        useBusStore.getState().addAlert({
          id: `alert-flow-${Date.now()}-${route.id}`,
          type: 'flow_threshold',
          title: '客流超阈值',
          message: `${route.name} 客流超过安全阈值，已自动建议区间车方案`,
          routeId: route.id,
          timestamp: new Date().toISOString(),
          read: false,
        })
      }
    })

    return triggered
  },
}))
