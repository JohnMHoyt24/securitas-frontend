import { Client } from '@stomp/stompjs'
import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { apiClient } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { Alert } from '../types'

const PATTERN_STYLES: Record<Alert['patternType'], string> = {
  CYCLE: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  FAN_IN: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  FAN_OUT: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
}

function accountIdsFrom(alert: Alert): string[] {
  try {
    const parsed = JSON.parse(alert.subgraphJson) as { accountIds?: string[] }
    return parsed.accountIds ?? []
  } catch {
    return []
  }
}

export function Dashboard() {
  const { user, logout } = useAuth()
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Securitas</h1>
          <p className="text-xs text-slate-400">AML &amp; Fraud Ring Tracker</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-slate-600'}`}
            />
            {connected ? 'Live' : 'Connecting...'}
          </span>
          <span className="text-sm text-slate-300">
            {user?.username} <span className="text-slate-500">({user?.role})</span>
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-300 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400">
          Alerts ({alerts.length})
        </h2>
        {alerts.length === 0 && (
          <p className="text-sm text-slate-500">No alerts yet. Trigger a scan from the backend to see them appear live.</p>
        )}
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={`rounded-lg border p-4 ${PATTERN_STYLES[alert.patternType]}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {alert.patternType.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'just now'}
                </span>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                Accounts: {accountIdsFrom(alert).join(', ')}
              </p>
              <p className="text-sm text-slate-200">
                {alert.narrative ?? 'Narrative pending...'}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
