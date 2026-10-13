import { Link } from 'react-router-dom'
import { useAlerts } from './AlertsContext'
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

export function AlertsList() {
  const { alerts } = useAlerts()

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-400">
        Alerts ({alerts.length})
      </h2>
      {alerts.length === 0 && (
        <p className="text-sm text-slate-500">No alerts yet. Trigger a scan from the backend to see them appear live.</p>
      )}
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link
              to={`/alerts/${alert.id}`}
              className={`block rounded-lg border p-4 transition hover:brightness-125 ${PATTERN_STYLES[alert.patternType]}`}
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
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
