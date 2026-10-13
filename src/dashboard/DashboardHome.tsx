import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { useAlerts } from '../alerts/AlertsContext'
import { AddWidgetForm } from './AddWidgetForm'
import { ChartWidgetCard } from './ChartWidgetCard'
import type { ChartType, MetricId } from './metrics'
import { DEFAULT_LAYOUT, type DashboardLayout, type Widget } from './Widget'

function parseLayout(layoutJson: string | undefined): DashboardLayout {
  if (!layoutJson) return DEFAULT_LAYOUT
  try {
    const parsed = JSON.parse(layoutJson) as DashboardLayout
    return Array.isArray(parsed.widgets) ? parsed : DEFAULT_LAYOUT
  } catch {
    return DEFAULT_LAYOUT
  }
}

export function DashboardHome() {
  const { alerts } = useAlerts()
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  useEffect(() => {
    apiClient
      .get<{ layoutJson: string } | null>('/dashboard')
      .then((res) => {
        setWidgets(parseLayout(res.data?.layoutJson).widgets)
      })
      .catch(() => setWidgets(DEFAULT_LAYOUT.widgets))
      .finally(() => setLoaded(true))
  }, [])

  function addWidget(metricId: MetricId, chartType: ChartType) {
    setWidgets((prev) => [...prev, { id: crypto.randomUUID(), metricId, chartType }])
  }

  function removeWidget(id: string) {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
  }

  async function saveLayout() {
    setSaveState('saving')
    const layout: DashboardLayout = { widgets }
    await apiClient.put('/dashboard', { layoutJson: JSON.stringify(layout) })
    setSaveState('saved')
    setTimeout(() => setSaveState('idle'), 1500)
  }

  if (!loaded) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          My dashboard
        </h2>
        <div className="flex items-center gap-3">
          {editing && saveState !== 'idle' && (
            <span className="text-xs text-slate-500">{saveState === 'saving' ? 'Saving...' : 'Saved'}</span>
          )}
          {editing && (
            <button
              type="button"
              onClick={saveLayout}
              className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
            >
              Save dashboard
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            {editing ? 'Done' : 'Customize'}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mb-6">
          <AddWidgetForm onAdd={addWidget} />
        </div>
      )}

      {widgets.length === 0 ? (
        <p className="text-sm text-slate-500">
          No charts yet. Click "Customize" to add one.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {widgets.map((widget) => (
            <ChartWidgetCard
              key={widget.id}
              widget={widget}
              alerts={alerts}
              editing={editing}
              onRemove={() => removeWidget(widget.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
