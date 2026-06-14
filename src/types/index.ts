export type UserRole = 'driver' | 'dispatcher' | 'manager' | 'company'
export type BusStatus = 'running' | 'charging' | 'idle' | 'maintenance'
export type PileStatus = 'idle' | 'charging' | 'fault'
export type StopType = 'terminal' | 'stop' | 'charging_station' | 'dispatch_center'
export type Direction = 'forward' | 'backward'
export type ScheduleStatus = 'pending' | 'departed' | 'completed'
export type ApprovalLevel = 'dispatcher' | 'manager' | 'company'
export type ApprovalAction = 'approved' | 'rejected'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ApprovalType = 'add_bus' | 'interval_bus'
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed'
export type AlertType = 'high_load' | 'low_battery' | 'pile_fault' | 'flow_threshold' | 'add_bus_request'

export interface BusVehicle {
  id: string
  routeId: string
  routeName: string
  position: [number, number, number]
  passengerRate: number
  batteryLevel: number
  status: BusStatus
  currentStopIndex: number
  direction: Direction
  speed: number
  progress: number
  chargingPileId?: string | null
}

export interface ChargingPile {
  id: string
  name: string
  position: [number, number, number]
  status: PileStatus
  currentBusId: string | null
  faultType: string | null
  utilization: number
}

export interface BusStop {
  id: string
  name: string
  position: [number, number, number]
  type: StopType
  passengerCount: number
  passengerFlow: number[]
  safetyThreshold: number
}

export interface BusRoute {
  id: string
  name: string
  color: string
  stops: string[]
  path: [number, number, number][]
  dispatchInterval: number
  schedule: ScheduleItem[]
  consecutiveHighLoad: number
  autoApprovalTriggered?: boolean
}

export interface ScheduleItem {
  id: string
  routeId: string
  busId: string
  departureTime: string
  direction: Direction
  loadRate: number
  status: ScheduleStatus
}

export interface ApprovalRequest {
  id: string
  type: ApprovalType
  routeId: string
  routeName: string
  reason: string
  currentLevel: ApprovalLevel
  approvals: ApprovalRecord[]
  status: ApprovalStatus
  createdAt: string
}

export interface ApprovalRecord {
  level: ApprovalLevel
  userId: string
  userName: string
  action: ApprovalAction
  comment: string
  timestamp: string
}

export interface WorkOrder {
  id: string
  chargingPileId: string
  pileName: string
  faultType: string
  status: WorkOrderStatus
  createdAt: string
  assignee: string
}

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  routeId?: string
  busId?: string
  pileId?: string
  timestamp: string
  read: boolean
}

export interface User {
  id: string
  name: string
  role: UserRole
  avatar: string
}

export interface DailyReport {
  date: string
  dispatchCount: number
  avgLoadRate: number
  chargingCount: number
  onTimeRate: number
  routeReports: RouteReport[]
  intervalBusTriggers: IntervalBusTriggerRecord[]
}

export interface IntervalBusTriggerRecord {
  id: string
  routeId: string
  routeName: string
  fromStopId: string
  toStopId: string
  triggeredAt: string
  status: 'proposed' | 'active' | 'cancelled'
}

export interface RouteReport {
  routeId: string
  routeName: string
  dispatchCount: number
  avgLoadRate: number
  chargingCount: number
  onTimeRate: number
  intervalBusTriggered: boolean
}

export interface TimelineEvent {
  time: string
  type: 'departure' | 'arrival' | 'charging' | 'alert' | 'adjustment'
  description: string
  routeId?: string
  busId?: string
}
