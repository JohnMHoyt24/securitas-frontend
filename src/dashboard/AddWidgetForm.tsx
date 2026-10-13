import { useState } from 'react'
import { METRICS, type ChartType, type MetricId } from './metrics'

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bar: 'Bar chart',
  line: 'Line chart',
  pie: 'Pie chart',
  histogram: 'Histogram',
  heatmap: 'Heatmap',
}

export function AddWidgetForm({ onAdd }: { onAdd: (metricId: MetricId, chartType: ChartType) => void }) {
  const [metricId, setMetricId] = useState<MetricId>(METRICS[0].id)
  const metric = METRICS.find((m) => m.id === metricId)!
  const [chartType, setChartType] = useState<ChartType>(metric.chartTypes[0])

  function handleMetricChange(id: MetricId) {
    setMetricId(id)
    const newMetric = METRICS.find((m) => m.id === id)!
    if (!newMetric.chartTypes.includes(chartType)) {
      setChartType(newMetric.chartTypes[0])
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 p-4">
      <div>
        <label className="mb-1 block text-xs text-slate-400" htmlFor="metric-select">
          Metric
        </label>
        <select
          id="metric-select"
          value={metricId}
          onChange={(e) => handleMetricChange(e.target.value as MetricId)}
          className="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
        >
          {METRICS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400" htmlFor="chart-type-select">
          Chart type
        </label>
        <select
          id="chart-type-select"
          value={chartType}
          onChange={(e) => setChartType(e.target.value as ChartType)}
          className="rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
        >
          {metric.chartTypes.map((type) => (
            <option key={type} value={type}>
              {CHART_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => onAdd(metricId, chartType)}
        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Add chart
      </button>
    </div>
  )
}
