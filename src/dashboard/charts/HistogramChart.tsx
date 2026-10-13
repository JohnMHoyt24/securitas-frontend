import { useState } from 'react'
import type { ChartPoint } from '../metrics'
import { CHART_INK, sequentialColorFor } from './palette'

const CHART_HEIGHT = 160
const BIN_WIDTH = 28
const GAP = 2 // touching bars — the surface-gap spacer, not categorical spacing

export function HistogramChart({ data }: { data: ChartPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const width = Math.max(1, data.length) * BIN_WIDTH
  // Thin out x-axis labels so they don't collide when there are many bins.
  const labelStride = Math.max(1, Math.ceil(data.length / 10))

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={CHART_HEIGHT + 28} role="img" aria-label="Histogram">
        <line x1={0} y1={CHART_HEIGHT} x2={width} y2={CHART_HEIGHT} stroke={CHART_INK.baseline} strokeWidth={1} />
        {data.map((d, i) => {
          const barHeight = d.value === 0 ? 0 : Math.max(4, (d.value / maxValue) * CHART_HEIGHT)
          const x = i * BIN_WIDTH + GAP / 2
          const y = CHART_HEIGHT - barHeight
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={BIN_WIDTH - GAP}
                height={barHeight}
                fill={sequentialColorFor(d.value, maxValue)}
                opacity={hoverIndex === i ? 0.8 : 1}
                tabIndex={0}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(i)}
                onBlur={() => setHoverIndex(null)}
                style={{ cursor: 'pointer' }}
              />
              {i % labelStride === 0 && (
                <text x={x + (BIN_WIDTH - GAP) / 2} y={CHART_HEIGHT + 18} textAnchor="middle" fontSize={9} fill={CHART_INK.muted}>
                  {d.label.slice(5)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {hoverIndex != null && (
        <div className="pointer-events-none absolute left-2 top-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs shadow-lg">
          <span className="font-semibold text-slate-100">{data[hoverIndex].value}</span>{' '}
          <span className="text-slate-400">{data[hoverIndex].label}</span>
        </div>
      )}
    </div>
  )
}
