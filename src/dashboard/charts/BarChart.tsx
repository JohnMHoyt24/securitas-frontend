import { useState } from 'react'
import type { ChartPoint } from '../metrics'
import { CHART_INK, foldToSlots } from './palette'

const CHART_HEIGHT = 160
const BAR_WIDTH = 24
const BAR_GAP = 48

export function BarChart({ data }: { data: ChartPoint[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const slots = foldToSlots(data)
  const maxValue = Math.max(1, ...slots.map((d) => d.value))
  const width = Math.max(1, slots.length) * (BAR_WIDTH + BAR_GAP)

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={CHART_HEIGHT + 44} role="img" aria-label="Bar chart">
        <line x1={0} y1={CHART_HEIGHT} x2={width} y2={CHART_HEIGHT} stroke={CHART_INK.baseline} strokeWidth={1} />
        {slots.map((d, i) => {
          const barHeight = d.value === 0 ? 0 : Math.max(8, (d.value / maxValue) * CHART_HEIGHT)
          const x = i * (BAR_WIDTH + BAR_GAP) + BAR_GAP / 2
          const y = CHART_HEIGHT - barHeight
          const isHovered = hovered === d.label
          return (
            <g key={d.label}>
              <rect
                x={x}
                y={y}
                width={BAR_WIDTH}
                height={barHeight}
                rx={4}
                fill={d.color}
                opacity={isHovered ? 0.85 : 1}
                tabIndex={0}
                onMouseEnter={() => setHovered(d.label)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(d.label)}
                onBlur={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              />
              <text x={x + BAR_WIDTH / 2} y={y - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill={CHART_INK.primary}>
                {d.value}
              </text>
              <text
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 20}
                textAnchor="middle"
                fontSize={11}
                fill={CHART_INK.muted}
              >
                {d.label.length > 12 ? `${d.label.slice(0, 11)}…` : d.label}
              </text>
            </g>
          )
        })}
      </svg>
      {hovered && (
        <div className="pointer-events-none absolute left-2 top-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs shadow-lg">
          <span className="font-semibold text-slate-100">{slots.find((d) => d.label === hovered)?.value}</span>{' '}
          <span className="text-slate-400">{hovered}</span>
        </div>
      )}
    </div>
  )
}
