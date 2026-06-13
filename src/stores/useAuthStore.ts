import { create } from 'zustand'
import type { User, UserRole } from '../types'
import { users } from '../data/mock'

interface LoginLog {
  userId: string
  userName: string
  role: UserRole
  timestamp: string
}

interface AuthState {
  currentUser: User | null
  isLoggedIn: boolean
  loginLogs: LoginLog[]
  login: (role: UserRole) => void
  logout: () => void
  addLoginLog: (log: LoginLog) => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  loginLogs: [],

  login: (role) => {
    const user = users.find((u) => u.role === role)
    if (user) {
      const log: LoginLog = {
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
      }
      set({
        currentUser: user,
        isLoggedIn: true,
        loginLogs: [...get().loginLogs, log],
      })
    }
  },

  logout: () => set({ currentUser: null, isLoggedIn: false }),

  addLoginLog: (log) => set((state) => ({
    loginLogs: [...state.loginLogs, log],
  })),
}))
