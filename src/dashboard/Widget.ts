import type { ChartType, MetricId } from './metrics'

export interface Widget {
  id: string
  metricId: MetricId
  chartType: ChartType
}

export interface DashboardLayout {
  widgets: Widget[]
}

export const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: [
    { id: 'default-1', metricId: 'alerts_by_pattern', chartType: 'bar' },
    { id: 'default-2', metricId: 'alerts_over_time', chartType: 'line' },
  ],
}
