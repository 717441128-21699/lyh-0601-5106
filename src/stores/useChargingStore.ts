import { create } from 'zustand'
import type { ChargingPile, WorkOrder } from '../types'
import { chargingPiles } from '../data/mock'

interface ChargingState {
  piles: ChargingPile[]
  workOrders: WorkOrder[]
  selectedPileId: string | null
  selectPile: (id: string | null) => void
  startCharging: (pileId: string, busId: string) => void
  stopCharging: (pileId: string) => void
  reportFault: (pileId: string, faultType: string) => void
  repairPile: (pileId: string) => void
  findNearestIdlePile: (position: [number, number, number]) => ChargingPile | null
}

export const useChargingStore = create<ChargingState>()((set, get) => {
  const initialWorkOrders: WorkOrder[] = chargingPiles
    .filter(p => p.status === 'fault')
    .map(p => ({
      id: `wo-init-${p.id}`,
      chargingPileId: p.id,
      pileName: p.name,
      faultType: p.faultType || '未知故障',
      status: 'pending' as const,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      assignee: '维修组',
    }))

  return {
  piles: chargingPiles,
  workOrders: initialWorkOrders,
  selectedPileId: null,

  selectPile: (id) => set({ selectedPileId: id }),

  startCharging: (pileId, busId) => set((state) => ({
    piles: state.piles.map((p) =>
      p.id === pileId ? { ...p, status: 'charging' as const, currentBusId: busId } : p
    ),
  })),

  stopCharging: (pileId) => set((state) => ({
    piles: state.piles.map((p) =>
      p.id === pileId ? { ...p, status: 'idle' as const, currentBusId: null } : p
    ),
  })),

  reportFault: (pileId, faultType) => set((state) => {
    const pile = state.piles.find((p) => p.id === pileId)
    if (!pile) return state
    const order: WorkOrder = {
      id: `wo-${Date.now()}`,
      chargingPileId: pileId,
      pileName: pile.name,
      faultType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignee: '维修组',
    }
    return {
      piles: state.piles.map((p) =>
        p.id === pileId ? { ...p, status: 'fault' as const, faultType } : p
      ),
      workOrders: [...state.workOrders, order],
    }
  }),

  repairPile: (pileId) => set((state) => ({
    piles: state.piles.map((p) =>
      p.id === pileId
        ? { ...p, status: 'idle' as const, faultType: null, currentBusId: null }
        : p
    ),
    workOrders: state.workOrders.map((o) =>
      o.chargingPileId === pileId && o.status !== 'completed'
        ? { ...o, status: 'completed' as const }
        : o
    ),
  })),

  findNearestIdlePile: (position) => {
    const { piles } = get()
    const idlePiles = piles.filter((p) => p.status === 'idle')
    if (idlePiles.length === 0) return null
    return idlePiles.reduce((nearest, pile) => {
      const d = Math.sqrt(
        (pile.position[0] - position[0]) ** 2 +
        (pile.position[1] - position[1]) ** 2 +
        (pile.position[2] - position[2]) ** 2
      )
      const nd = Math.sqrt(
        (nearest.position[0] - position[0]) ** 2 +
        (nearest.position[1] - position[1]) ** 2 +
        (nearest.position[2] - position[2]) ** 2
      )
      return d < nd ? pile : nearest
    })
  },
}})
