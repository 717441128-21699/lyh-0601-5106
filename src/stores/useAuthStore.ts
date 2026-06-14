import { create } from 'zustand'
import type { User, UserRole } from '../types'
import { users } from '../data/mock'

const STORAGE_KEY = 'bus-platform-auth'

interface LoginLog {
  userId: string
  userName: string
  role: UserRole
  timestamp: string
}

interface PersistedState {
  currentUser: User | null
  isLoggedIn: boolean
  loginLogs: LoginLog[]
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      return {
        currentUser: parsed.currentUser || null,
        isLoggedIn: !!parsed.isLoggedIn,
        loginLogs: Array.isArray(parsed.loginLogs) ? parsed.loginLogs : [],
      }
    }
  } catch {
    // ignore
  }
  return { currentUser: null, isLoggedIn: false, loginLogs: [] }
}

function persist(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

interface AuthState extends PersistedState {
  login: (role: UserRole) => void
  logout: () => void
  addLoginLog: (log: LoginLog) => void
}

const initial = loadPersisted()

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initial,

  login: (role) => {
    const user = users.find((u) => u.role === role)
    if (user) {
      const log: LoginLog = {
        userId: user.id,
        userName: user.name,
        role: user.role,
        timestamp: new Date().toISOString(),
      }
      const next = {
        currentUser: user,
        isLoggedIn: true,
        loginLogs: [...get().loginLogs, log],
      }
      set(next)
      persist(next)
    }
  },

  logout: () => {
    const next = {
      currentUser: null,
      isLoggedIn: false,
      loginLogs: get().loginLogs,
    }
    set(next)
    persist(next)
  },

  addLoginLog: (log) => {
    const next = {
      ...get(),
      loginLogs: [...get().loginLogs, log],
    }
    set(next)
    persist(next)
  },
}))
