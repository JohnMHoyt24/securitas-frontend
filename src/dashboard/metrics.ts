import { apiClient } from '../api/client'
import type { Alert } from '../types'

export type ChartType = 'bar' | 'line' | 'pie' | 'histogram' | 'heatmap'

export type MetricId =
  | 'alerts_by_pattern'
  | 'alerts_by_status'
  | 'alerts_over_time'
  | 'alerts_heatmap'
  | 'transactions_by_day'
  | 'transaction_volume_by_day'
  | 'transactions_by_payment_format'
  | 'accounts_by_bank'

export interface ChartPoint {
  label: string
  value: number
}

export interface HeatmapCell {
  row: string
  col: string
  value: number
}

export interface MetricDef {
  id: MetricId
  label: string
  chartTypes: ChartType[]
  /** 'alerts' metrics recompute from the live WS feed; 'backend' metrics fetch once. */
  source: 'alerts' | 'backend'
}

export const METRICS: MetricDef[] = [
  { id: 'alerts_by_pattern', label: 'Alerts by pattern type', chartTypes: ['bar', 'pie'], source: 'alerts' },
  { id: 'alerts_by_status', label: 'Alerts by status', chartTypes: ['bar', 'pie'], source: 'alerts' },
  { id: 'alerts_over_time', label: 'Alerts over time', chartTypes: ['line', 'histogram'], source: 'alerts' },
  { id: 'alerts_heatmap', label: 'Alerts: pattern x day', chartTypes: ['heatmap'], source: 'alerts' },
  { id: 'transactions_by_day', label: 'Transaction count by day', chartTypes: ['line', 'histogram'], source: 'backend' },
  { id: 'transaction_volume_by_day', label: 'Transaction volume by day', chartTypes: ['line', 'histogram'], source: 'backend' },
  { id: 'transactions_by_payment_format', label: 'Transactions by payment format', chartTypes: ['bar', 'pie'], source: 'backend' },
  { id: 'accounts_by_bank', label: 'Accounts by bank', chartTypes: ['bar', 'pie'], source: 'backend' },
]

export function metricById(id: MetricId): MetricDef {
  const metric = METRICS.find((m) => m.id === id)
  if (!metric) throw new Error(`Unknown metric: ${id}`)
  return metric
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function alertsByPattern(alerts: Alert[]): ChartPoint[] {
  return (['CYCLE', 'FAN_IN', 'FAN_OUT'] as const).map((type) => ({
    label: type.replace('_', ' '),
    value: alerts.filter((a) => a.patternType === type).length,
  }))
}

function alertsByStatus(alerts: Alert[]): ChartPoint[] {
  return (['NEW', 'REVIEWING', 'CLOSED'] as const).map((status) => ({
    label: status,
    value: alerts.filter((a) => a.status === status).length,
  }))
}

function alertsOverTime(alerts: Alert[]): ChartPoint[] {
  const counts = new Map<string, number>()
  for (const alert of alerts) {
    if (!alert.createdAt) continue
    const key = dayKey(alert.createdAt)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }))
}

function alertsHeatmap(alerts: Alert[]): HeatmapCell[] {
  const cells = new Map<string, number>()
  for (const alert of alerts) {
    if (!alert.createdAt) continue
    const key = `${alert.patternType}|${dayKey(alert.createdAt)}`
    cells.set(key, (cells.get(key) ?? 0) + 1)
  }
  return [...cells.entries()].map(([key, value]) => {
    const [row, col] = key.split('|')
    return { row, col, value }
  })
}

/** Alert-derived metrics compute client-side from the already-loaded live feed; others hit the backend. */
export async function fetchMetric(id: MetricId, alerts: Alert[]): Promise<ChartPoint[] | HeatmapCell[]> {
  switch (id) {
    case 'alerts_by_pattern':
      return alertsByPattern(alerts)
    case 'alerts_by_status':
      return alertsByStatus(alerts)
    case 'alerts_over_time':
      return alertsOverTime(alerts)
    case 'alerts_heatmap':
      return alertsHeatmap(alerts)
    case 'transactions_by_day': {
      const res = await apiClient.get<{ date: string; count: number }[]>('/metrics/transactions-by-day')
      return res.data.map((d) => ({ label: d.date, value: d.count }))
    }
    case 'transaction_volume_by_day': {
      const res = await apiClient.get<{ date: string; amount: number }[]>('/metrics/transaction-volume-by-day')
      return res.data.map((d) => ({ label: d.date, value: d.amount }))
    }
    case 'transactions_by_payment_format': {
      const res = await apiClient.get<{ category: string; count: number }[]>('/metrics/transactions-by-payment-format')
      return res.data.map((d) => ({ label: d.category, value: d.count }))
    }
    case 'accounts_by_bank': {
      const res = await apiClient.get<{ category: string; count: number }[]>('/metrics/accounts-by-bank')
      return res.data.map((d) => ({ label: d.category, value: d.count }))
    }
  }
}
