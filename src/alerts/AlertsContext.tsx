import { Client } from '@stomp/stompjs'
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import SockJS from 'sockjs-client'
import { apiClient } from '../api/client'
import type { Alert } from '../types'

interface AlertsContextValue {
  alerts: Alert[]
  connected: boolean
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    apiClient.get<Alert[]>('/alerts').then((res) => {
      const sorted = [...res.data].sort((a, b) => b.id - a.id)
      setAlerts(sorted)
    })
  }, [])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      setConnected(true)
      client.subscribe('/topic/alerts', (message) => {
        const alert = JSON.parse(message.body) as Alert
        setAlerts((prev) => {
          if (prev.some((a) => a.id === alert.id)) {
            return prev.map((a) => (a.id === alert.id ? alert : a))
          }
          return [alert, ...prev]
        })
      })
    }
    client.onDisconnect = () => setConnected(false)

    client.activate()
    return () => {
      void client.deactivate()
    }
  }, [])

  const value = useMemo(() => ({ alerts, connected }), [alerts, connected])

  return <AlertsContext value={value}>{children}</AlertsContext>
}

export function useAlerts(): AlertsContextValue {
  const ctx = use(AlertsContext)
  if (!ctx) throw new Error('useAlerts must be used within an AlertsProvider')
  return ctx
}
