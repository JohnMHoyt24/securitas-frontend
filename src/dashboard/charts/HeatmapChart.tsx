import { useState } from 'react'
import type { HeatmapCell } from '../metrics'
import { CHART_INK, sequentialColorFor } from './palette'

const CELL_SIZE = 32
const CELL_GAP = 2
const ROW_LABEL_WIDTH = 90

export function HeatmapChart({ data }: { data: HeatmapCell[] }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const rows = [...new Set(data.map((d) => d.row))].sort()
  const cols = [...new Set(data.map((d) => d.col))].sort()
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const byKey = new Map(data.map((d) => [`${d.row}|${d.col}`, d.value]))

  const width = ROW_LABEL_WIDTH + cols.length * (CELL_SIZE + CELL_GAP)
  const height = rows.length * (CELL_SIZE + CELL_GAP) + 32

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height} role="img" aria-label="Heatmap">
        {rows.map((row, ri) => (
          <text
            key={row}
            x={ROW_LABEL_WIDTH - 8}
            y={ri * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 4}
            textAnchor="end"
            fontSize={11}
            fill={CHART_INK.muted}
          >
            {row.replace('_', ' ')}
          </text>
        ))}
        {cols.map((col, ci) => (
          <text
            key={col}
            x={ROW_LABEL_WIDTH + ci * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
            y={rows.length * (CELL_SIZE + CELL_GAP) + 16}
            textAnchor="middle"
            fontSize={9}
            fill={CHART_INK.muted}
          >
            {col.slice(5)}
          </text>
        ))}
        {rows.map((row, ri) =>
          cols.map((col, ci) => {
            const key = `${row}|${col}`
            const value = byKey.get(key) ?? 0
            const x = ROW_LABEL_WIDTH + ci * (CELL_SIZE + CELL_GAP)
            const y = ri * (CELL_SIZE + CELL_GAP)
            return (
              <rect
                key={key}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={3}
                fill={value === 0 ? '#1e293b' : sequentialColorFor(value, maxValue)}
                opacity={hoveredKey === null || hoveredKey === key ? 1 : 0.6}
                tabIndex={0}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(key)}
                onBlur={() => setHoveredKey(null)}
                style={{ cursor: 'pointer' }}
              />
            )
          }),
        )}
      </svg>
      {hoveredKey && (
        <div className="pointer-events-none absolute left-2 top-0 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs shadow-lg">
          <span className="font-semibold text-slate-100">{byKey.get(hoveredKey) ?? 0}</span>{' '}
          <span className="text-slate-400">{hoveredKey.replace('|', ' / ')}</span>
        </div>
      )}
    </div>
  )
}
