import { useState } from 'react'
import type { ChartPoint } from '../metrics'
import { CHART_INK, foldToSlots } from './palette'

const RADIUS = 80
const CENTER = RADIUS + 10
const PIE_MAX_SEGMENTS = 6 // part-to-whole at a glance only — fold the rest into "Other"

function polarToCartesian(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CENTER + RADIUS * Math.cos(rad), y: CENTER + RADIUS * Math.sin(rad) }
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle)
  const end = polarToCartesian(startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export function PieChart({ data }: { data: ChartPoint[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const slots = foldToSlots(data, PIE_MAX_SEGMENTS)
  const total = slots.reduce((sum, d) => sum + d.value, 0) || 1

  const slices = slots.reduce<Array<(typeof slots)[number] & { startAngle: number; endAngle: number; fraction: number }>>(
    (acc, d) => {
      const fraction = d.value / total
      const cursor = acc.length === 0 ? 0 : acc[acc.length - 1].endAngle / 360
      const startAngle = cursor * 360
      const endAngle = (cursor + fraction) * 360
      acc.push({ ...d, startAngle, endAngle, fraction })
      return acc
    },
    [],
  )

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative">
        <svg width={CENTER * 2} height={CENTER * 2} role="img" aria-label="Pie chart">
          {slices.map((s) => (
            <path
              key={s.label}
              d={arcPath(s.startAngle, s.endAngle)}
              fill={s.color}
              stroke="#0f172a"
              strokeWidth={2}
              opacity={hovered === null || hovered === s.label ? 1 : 0.5}
              tabIndex={0}
              onMouseEnter={() => setHovered(s.label)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.label)}
              onBlur={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {slices.map((s) =>
            s.fraction >= 0.08 ? (
              <text
                key={`label-${s.label}`}
                x={polarToCartesian((s.startAngle + s.endAngle) / 2).x * 0.7 + CENTER * 0.3}
                y={polarToCartesian((s.startAngle + s.endAngle) / 2).y * 0.7 + CENTER * 0.3}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#ffffff"
              >
                {Math.round(s.fraction * 100)}%
              </text>
            ) : null,
          )}
        </svg>
        {hovered && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs shadow-lg">
            <span className="font-semibold text-slate-100">{slices.find((s) => s.label === hovered)?.value}</span>{' '}
            <span className="text-slate-400">{hovered}</span>
          </div>
        )}
      </div>
      <ul className="space-y-1.5">
        {slices.map((s) => (
          <li
            key={s.label}
            className="flex cursor-pointer items-center gap-2 text-xs"
            onMouseEnter={() => setHovered(s.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span style={{ color: CHART_INK.secondary }}>{s.label}</span>
            <span className="font-medium" style={{ color: CHART_INK.primary }}>
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
