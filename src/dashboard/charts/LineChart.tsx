import { useRef, useState } from 'react'
import type { ChartPoint } from '../metrics'
import { CATEGORICAL_PALETTE, CHART_INK } from './palette'

const CHART_HEIGHT = 160
const PADDING_X = 24

export function LineChart({ data }: { data: ChartPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const width = Math.max(320, data.length * 48)
  const maxValue = Math.max(1, ...data.map((d) => d.value))

  const points = data.map((d, i) => {
    const x = data.length <= 1 ? width / 2 : PADDING_X + (i / (data.length - 1)) * (width - PADDING_X * 2)
    const y = CHART_HEIGHT - (d.value / maxValue) * (CHART_HEIGHT - 16)
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg || points.length === 0) return
    const rect = svg.getBoundingClientRect()
    const scaleX = width / rect.width
    const pointerX = (e.clientX - rect.left) * scaleX
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - pointerX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex != null ? points[hoverIndex] : null

  return (
    <div className="relative overflow-x-auto">
      <svg
        ref={svgRef}
        width={width}
        height={CHART_HEIGHT + 28}
        role="img"
        aria-label="Line chart"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <line x1={0} y1={CHART_HEIGHT} x2={width} y2={CHART_HEIGHT} stroke={CHART_INK.baseline} strokeWidth={1} />
        <path d={path} fill="none" stroke={CATEGORICAL_PALETTE[0]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill={CATEGORICAL_PALETTE[0]}
            stroke="#0f172a"
            strokeWidth={2}
          />
        )}
        {hovered && (
          <>
            <line x1={hovered.x} y1={0} x2={hovered.x} y2={CHART_HEIGHT} stroke={CHART_INK.gridline} strokeWidth={1} />
            <circle cx={hovered.x} cy={hovered.y} r={5} fill={CATEGORICAL_PALETTE[0]} stroke="#0f172a" strokeWidth={2} />
          </>
        )}
        {points.map((p, i) =>
          i === 0 || i === points.length - 1 || i === hoverIndex ? (
            <text key={p.label} x={p.x} y={CHART_HEIGHT + 20} textAnchor="middle" fontSize={10} fill={CHART_INK.muted}>
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
      {hovered && (
        <div
          className="pointer-events-none absolute top-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs shadow-lg"
          style={{ left: Math.min(hovered.x, width - 80) }}
        >
          <span className="font-semibold text-slate-100">{hovered.value}</span>{' '}
          <span className="text-slate-400">{hovered.label}</span>
        </div>
      )}
    </div>
  )
}
