import { useEffect, useState } from 'react'
import { BarChart } from './charts/BarChart'
import { HeatmapChart } from './charts/HeatmapChart'
import { HistogramChart } from './charts/HistogramChart'
import { LineChart } from './charts/LineChart'
import { PieChart } from './charts/PieChart'
import { fetchMetric, metricById, type ChartPoint, type HeatmapCell } from './metrics'
import type { Widget } from './Widget'
import type { Alert } from '../types'

function renderChart(widget: Widget, data: ChartPoint[] | HeatmapCell[]) {
  switch (widget.chartType) {
    case 'bar':
      return <BarChart data={data as ChartPoint[]} />
    case 'line':
      return <LineChart data={data as ChartPoint[]} />
    case 'pie':
      return <PieChart data={data as ChartPoint[]} />
    case 'histogram':
      return <HistogramChart data={data as ChartPoint[]} />
    case 'heatmap':
      return <HeatmapChart data={data as HeatmapCell[]} />
  }
}

export function ChartWidgetCard({
  widget,
  alerts,
  editing,
  onRemove,
}: {
  widget: Widget
  alerts: Alert[]
  editing: boolean
  onRemove: () => void
}) {
  const metric = metricById(widget.metricId)
  const [data, setData] = useState<ChartPoint[] | HeatmapCell[] | null>(null)
  const alertsDependency = metric?.source === 'alerts' ? alerts : null

  useEffect(() => {
    if (!metric) return
    let cancelled = false
    fetchMetric(widget.metricId, alertsDependency ?? []).then((result) => {
      if (!cancelled) setData(result)
    })
    return () => {
      cancelled = true
    }
    // Backend-sourced metrics fetch once on mount; alert-derived ones recompute whenever
    // the live feed changes — alertsDependency is null (constant) for backend metrics so
    // this effect only re-runs on metricId/chartType changes for those widgets.
  }, [widget.metricId, widget.chartType, alertsDependency, metric])

  if (!metric) {
    return (
      <div className="rounded-lg border border-amber-800 bg-amber-950/30 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-medium text-amber-300">Unknown chart configuration</h3>
          {editing && (
            <button type="button" onClick={onRemove} className="text-xs text-amber-500 hover:text-red-400">
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-amber-500/80">
          This widget references a metric ("{widget.metricId}") that no longer exists. Remove it and add a new chart.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-200">{metric.label}</h3>
        {editing && (
          <button type="button" onClick={onRemove} className="text-xs text-slate-500 hover:text-red-400">
            Remove
          </button>
        )}
      </div>
      {data === null ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">No data yet.</p>
      ) : (
        renderChart(widget, data)
      )}
    </div>
  )
}
