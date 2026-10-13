import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { apiClient } from '../api/client'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  const username = localStorage.getItem('securitas_username')
  const role = localStorage.getItem('securitas_role')
  if (!username || !role) return null
  return { username, role: role as AuthUser['role'] }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser)

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post<{ token: string; username: string; role: AuthUser['role'] }>(
      '/auth/login',
      { username, password },
    )
    const { token, username: respUsername, role } = response.data
    localStorage.setItem('securitas_token', token)
    localStorage.setItem('securitas_username', respUsername)
    localStorage.setItem('securitas_role', role)
    setUser({ username: respUsername, role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('securitas_token')
    localStorage.removeItem('securitas_username')
    localStorage.removeItem('securitas_role')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
