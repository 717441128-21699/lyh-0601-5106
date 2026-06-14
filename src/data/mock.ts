import type {
  BusRoute, BusVehicle, BusStop, User, ChargingPile,
  ScheduleItem, DailyReport, RouteReport, ApprovalRequest, IntervalBusTriggerRecord
} from '../types'

export const dispatchCenter: BusStop = {
  id: 'dispatch-center',
  name: '调度中心',
  position: [50, 0, -30],
  type: 'dispatch_center',
  passengerCount: 0,
  passengerFlow: [0, 0, 0, 0, 0, 0, 0],
  safetyThreshold: 999,
}

function genPath(points: [number, number][], yBase = 0.1): [number, number, number][] {
  return points.map(([x, z]) => [x, yBase, z] as [number, number, number])
}

export const routes: BusRoute[] = [
  {
    id: 'route-1',
    name: '1路',
    color: '#00f0ff',
    stops: ['stop-t1', 'stop-101', 'stop-102', 'stop-103', 'stop-104', 'stop-105', 'stop-t2'],
    path: genPath([[-35, 0], [-20, -5], [-5, 5], [10, 10], [25, 5], [35, -5], [35, 25]]),
    dispatchInterval: 8,
    schedule: [],
    consecutiveHighLoad: 0,
  },
  {
    id: 'route-2',
    name: '2路',
    color: '#ff6b35',
    stops: ['stop-t2', 'stop-201', 'stop-202', 'stop-203', 'stop-204', 'stop-t3'],
    path: genPath([[35, 25], [25, 30], [10, 35], [-5, 30], [-20, 35], [-35, 30]]),
    dispatchInterval: 10,
    schedule: [],
    consecutiveHighLoad: 0,
  },
  {
    id: 'route-3',
    name: '3路',
    color: '#00ff88',
    stops: ['stop-t3', 'stop-301', 'stop-302', 'stop-303', 'stop-304', 'stop-t1'],
    path: genPath([[-35, 30], [-30, 15], [-25, 5], [-15, -10], [-5, -20], [-35, 0]]),
    dispatchInterval: 12,
    schedule: [],
    consecutiveHighLoad: 0,
  },
  {
    id: 'route-4',
    name: '4路',
    color: '#f5a623',
    stops: ['stop-t1', 'stop-401', 'stop-402', 'stop-403', 'stop-t2'],
    path: genPath([[-35, 0], [-20, 10], [-5, -5], [10, 15], [35, 25]]),
    dispatchInterval: 9,
    schedule: [],
    consecutiveHighLoad: 0,
  },
  {
    id: 'route-5',
    name: '5路',
    color: '#e84393',
    stops: ['stop-t2', 'stop-501', 'stop-502', 'stop-503', 'stop-t3'],
    path: genPath([[35, 25], [20, 20], [5, 25], [-10, 20], [-35, 30]]),
    dispatchInterval: 11,
    schedule: [],
    consecutiveHighLoad: 0,
  },
  {
    id: 'route-6',
    name: '6路',
    color: '#6c5ce7',
    stops: ['stop-t3', 'stop-601', 'stop-602', 'stop-603', 'stop-604', 'stop-t1'],
    path: genPath([[-35, 30], [-25, 20], [-15, 10], [-5, 0], [10, -10], [-35, 0]]),
    dispatchInterval: 10,
    schedule: [],
    consecutiveHighLoad: 0,
  },
]

export const stops: BusStop[] = [
  { id: 'stop-t1', name: '火车北站', position: [-35, 0.5, 0], type: 'terminal', passengerCount: 180, passengerFlow: [120, 150, 180, 210, 190, 160, 130], safetyThreshold: 250 },
  { id: 'stop-t2', name: '高新区站', position: [35, 0.5, 25], type: 'terminal', passengerCount: 150, passengerFlow: [100, 130, 150, 180, 170, 140, 110], safetyThreshold: 220 },
  { id: 'stop-t3', name: '文化广场站', position: [-35, 0.5, 30], type: 'terminal', passengerCount: 160, passengerFlow: [110, 140, 160, 190, 180, 150, 120], safetyThreshold: 230 },
  { id: 'stop-101', name: '人民公园', position: [-20, 0.5, -5], type: 'stop', passengerCount: 95, passengerFlow: [60, 80, 95, 110, 100, 85, 70], safetyThreshold: 150 },
  { id: 'stop-102', name: '市政府', position: [-5, 0.5, 5], type: 'stop', passengerCount: 110, passengerFlow: [70, 90, 110, 130, 120, 100, 80], safetyThreshold: 170 },
  { id: 'stop-103', name: '中心医院', position: [10, 0.5, 10], type: 'stop', passengerCount: 85, passengerFlow: [55, 75, 85, 100, 95, 80, 65], safetyThreshold: 140 },
  { id: 'stop-104', name: '科技园', position: [25, 0.5, 5], type: 'stop', passengerCount: 75, passengerFlow: [50, 65, 75, 90, 85, 70, 55], safetyThreshold: 130 },
  { id: 'stop-105', name: '会展中心', position: [35, 0.5, -5], type: 'stop', passengerCount: 130, passengerFlow: [90, 110, 130, 160, 150, 120, 95], safetyThreshold: 200 },
  { id: 'stop-201', name: '商业街', position: [25, 0.5, 30], type: 'stop', passengerCount: 140, passengerFlow: [95, 120, 140, 170, 160, 130, 100], safetyThreshold: 210 },
  { id: 'stop-202', name: '大学城', position: [10, 0.5, 35], type: 'stop', passengerCount: 120, passengerFlow: [80, 100, 120, 150, 140, 110, 85], safetyThreshold: 190 },
  { id: 'stop-203', name: '体育馆', position: [-5, 0.5, 30], type: 'stop', passengerCount: 70, passengerFlow: [45, 60, 70, 85, 80, 65, 50], safetyThreshold: 120 },
  { id: 'stop-204', name: '奥体中心', position: [-20, 0.5, 35], type: 'stop', passengerCount: 100, passengerFlow: [65, 85, 100, 125, 115, 90, 70], safetyThreshold: 170 },
  { id: 'stop-301', name: '老城区', position: [-30, 0.5, 15], type: 'stop', passengerCount: 105, passengerFlow: [70, 90, 105, 130, 120, 95, 75], safetyThreshold: 175 },
  { id: 'stop-302', name: '火车站南', position: [-25, 0.5, 5], type: 'stop', passengerCount: 90, passengerFlow: [60, 75, 90, 110, 105, 85, 65], safetyThreshold: 155 },
  { id: 'stop-303', name: '工业园', position: [-15, 0.5, -10], type: 'stop', passengerCount: 65, passengerFlow: [40, 55, 65, 80, 75, 60, 45], safetyThreshold: 110 },
  { id: 'stop-304', name: '物流园', position: [-5, 0.5, -20], type: 'stop', passengerCount: 55, passengerFlow: [35, 45, 55, 70, 65, 50, 38], safetyThreshold: 95 },
  { id: 'stop-401', name: '金融街', position: [-20, 0.5, 10], type: 'stop', passengerCount: 125, passengerFlow: [85, 105, 125, 155, 145, 115, 90], safetyThreshold: 200 },
  { id: 'stop-402', name: '动物园', position: [-5, 0.5, -5], type: 'stop', passengerCount: 80, passengerFlow: [50, 70, 80, 95, 90, 75, 55], safetyThreshold: 135 },
  { id: 'stop-403', name: '软件园', position: [10, 0.5, 15], type: 'stop', passengerCount: 95, passengerFlow: [65, 80, 95, 115, 110, 90, 70], safetyThreshold: 165 },
  { id: 'stop-501', name: '艺术中心', position: [20, 0.5, 20], type: 'stop', passengerCount: 88, passengerFlow: [58, 75, 88, 108, 102, 82, 62], safetyThreshold: 150 },
  { id: 'stop-502', name: '博物馆', position: [5, 0.5, 25], type: 'stop', passengerCount: 72, passengerFlow: [48, 62, 72, 88, 82, 68, 50], safetyThreshold: 125 },
  { id: 'stop-503', name: '图书馆', position: [-10, 0.5, 20], type: 'stop', passengerCount: 60, passengerFlow: [38, 50, 60, 75, 70, 55, 42], safetyThreshold: 105 },
  { id: 'stop-601', name: '翠湖公园', position: [-25, 0.5, 20], type: 'stop', passengerCount: 78, passengerFlow: [52, 66, 78, 95, 90, 72, 55], safetyThreshold: 135 },
  { id: 'stop-602', name: '银河路', position: [-15, 0.5, 10], type: 'stop', passengerCount: 92, passengerFlow: [62, 78, 92, 112, 106, 85, 65], safetyThreshold: 160 },
  { id: 'stop-603', name: '海洋路', position: [-5, 0.5, 0], type: 'stop', passengerCount: 108, passengerFlow: [72, 92, 108, 132, 125, 98, 75], safetyThreshold: 180 },
  { id: 'stop-604', name: '航空港', position: [10, 0.5, -10], type: 'stop', passengerCount: 115, passengerFlow: [78, 98, 115, 140, 135, 105, 82], safetyThreshold: 190 },
  dispatchCenter,
]

function createBusesForRoute(route: BusRoute, count: number, startIdx: number): BusVehicle[] {
  const buses: BusVehicle[] = []
  for (let i = 0; i < count; i++) {
    const pathIdx = Math.floor((i / count) * (route.path.length - 1))
    const nextIdx = Math.min(pathIdx + 1, route.path.length - 1)
    const pos = route.path[pathIdx]
    buses.push({
      id: `bus-${startIdx + i}`,
      routeId: route.id,
      routeName: route.name,
      position: pos,
      passengerRate: 0.4 + Math.random() * 0.55,
      batteryLevel: 0.3 + Math.random() * 0.7,
      status: 'running',
      currentStopIndex: pathIdx,
      direction: 'forward',
      speed: 35 + Math.random() * 15,
      progress: Math.random(),
    })
  }
  return buses
}

export const buses: BusVehicle[] = [
  ...createBusesForRoute(routes[0], 6, 1),
  ...createBusesForRoute(routes[1], 5, 7),
  ...createBusesForRoute(routes[2], 5, 12),
  ...createBusesForRoute(routes[3], 5, 17),
  ...createBusesForRoute(routes[4], 5, 22),
  ...createBusesForRoute(routes[5], 4, 27),
]

buses[2].passengerRate = 0.92
buses[2].batteryLevel = 0.85
buses[10].passengerRate = 0.91
buses[15].passengerRate = 0.94
buses[15].batteryLevel = 0.15
buses[20].batteryLevel = 0.12

export const users: User[] = [
  { id: 'user-1', name: '张伟', role: 'driver', avatar: '' },
  { id: 'user-2', name: '刘洋', role: 'driver', avatar: '' },
  { id: 'user-3', name: '李明', role: 'dispatcher', avatar: '' },
  { id: 'user-4', name: '王芳', role: 'manager', avatar: '' },
  { id: 'user-5', name: '赵总', role: 'company', avatar: '' },
]

export const chargingPiles: ChargingPile[] = [
  { id: 'pile-t1-1', name: '北站充电桩1', position: [-38, 0.3, -4], status: 'idle', currentBusId: null, faultType: null, utilization: 0.62 },
  { id: 'pile-t1-2', name: '北站充电桩2', position: [-38, 0.3, 4], status: 'idle', currentBusId: null, faultType: null, utilization: 0.58 },
  { id: 'pile-t2-1', name: '高新区充电桩1', position: [38, 0.3, 21], status: 'charging', currentBusId: 'bus-4', faultType: null, utilization: 0.75 },
  { id: 'pile-t2-2', name: '高新区充电桩2', position: [38, 0.3, 29], status: 'idle', currentBusId: null, faultType: null, utilization: 0.68 },
  { id: 'pile-t3-1', name: '文化广场充电桩1', position: [-38, 0.3, 26], status: 'fault', currentBusId: null, faultType: '充电模块故障', utilization: 0.22 },
  { id: 'pile-t3-2', name: '文化广场充电桩2', position: [-38, 0.3, 34], status: 'idle', currentBusId: null, faultType: null, utilization: 0.55 },
  { id: 'pile-dc-1', name: '调度中心充电桩1', position: [47, 0.3, -30], status: 'idle', currentBusId: null, faultType: null, utilization: 0.40 },
  { id: 'pile-dc-2', name: '调度中心充电桩2', position: [53, 0.3, -30], status: 'charging', currentBusId: 'bus-28', faultType: null, utilization: 0.45 },
]

export function generateSchedule(routeId: string, route: BusRoute, busIds: string[], dayStart: Date): ScheduleItem[] {
  const items: ScheduleItem[] = []
  const startHour = 6
  const endHour = 22
  let itemIdx = 0
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += route.dispatchInterval) {
      const busId = busIds[itemIdx % busIds.length]
      const dep = new Date(dayStart)
      dep.setHours(hour, min, 0, 0)
      items.push({
        id: `sch-${routeId}-${itemIdx}`,
        routeId,
        busId,
        departureTime: dep.toISOString(),
        direction: itemIdx % 2 === 0 ? 'forward' : 'backward',
        loadRate: 0.3 + Math.random() * 0.65,
        status: dep.getTime() < Date.now() ? (Math.random() > 0.3 ? 'completed' : 'departed') : 'pending',
      })
      itemIdx++
    }
  }
  return items
}

const today = new Date()
today.setHours(0, 0, 0, 0)
routes.forEach((r) => {
  const rBuses = buses.filter((b) => b.routeId === r.id).map((b) => b.id)
  r.schedule = generateSchedule(r.id, r, rBuses, today)
  if (r.id === 'route-1') {
    r.schedule.slice(0, 3).forEach((s) => { s.loadRate = 0.91 + Math.random() * 0.07 })
    r.consecutiveHighLoad = 3
  }
})

export function generateReportData(dateStr: string, triggers?: IntervalBusTriggerRecord[]): DailyReport {
  const date = new Date(dateStr)
  const intervalBusTriggers = triggers && triggers.length > 0
    ? triggers
    : routes
        .filter(() => Math.random() > 0.7)
        .map((r, i) => ({
          id: `report-trigger-${i}`,
          routeId: r.id,
          routeName: r.name,
          fromStopId: r.stops[0],
          toStopId: r.stops[r.stops.length - 1],
          triggeredAt: new Date(date.getTime() + Math.random() * 86400000).toISOString(),
          status: (['proposed', 'active', 'cancelled'] as const)[Math.floor(Math.random() * 3)],
        }))

  const triggeredRouteIds = new Set(intervalBusTriggers.map((t) => t.routeId))

  const routeReports: RouteReport[] = routes.map((r) => ({
    routeId: r.id,
    routeName: r.name,
    dispatchCount: 60 + Math.floor(Math.random() * 40),
    avgLoadRate: 0.55 + Math.random() * 0.3,
    chargingCount: 5 + Math.floor(Math.random() * 10),
    onTimeRate: 0.85 + Math.random() * 0.12,
    intervalBusTriggered: triggeredRouteIds.has(r.id),
  }))
  return {
    date: date.toISOString().slice(0, 10),
    dispatchCount: routeReports.reduce((s, r) => s + r.dispatchCount, 0),
    avgLoadRate: routeReports.reduce((s, r) => s + r.avgLoadRate, 0) / routeReports.length,
    chargingCount: routeReports.reduce((s, r) => s + r.chargingCount, 0),
    onTimeRate: routeReports.reduce((s, r) => s + r.onTimeRate, 0) / routeReports.length,
    routeReports,
    intervalBusTriggers,
  }
}

export const initialApprovals: ApprovalRequest[] = [
  {
    id: 'appr-1',
    type: 'add_bus',
    routeId: 'route-1',
    routeName: '1路',
    reason: '1路连续3个班次满载率超过90%，早高峰客流持续增长',
    currentLevel: 'dispatcher',
    approvals: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]
