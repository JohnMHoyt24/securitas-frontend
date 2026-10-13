import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../api/client'
import type { Alert, SubgraphNode, SubgraphResponse } from '../types'

const ROLE_COLORS: Record<SubgraphNode['role'], string> = {
  origin: '#38bdf8',
  mule: '#fb923c',
  destination: '#4ade80',
  cycle: '#fbbf24',
}

function layout(nodes: SubgraphNode[], patternType: string): Record<string, { x: number; y: number }> {
  const centerX = 320
  const centerY = 220
  const radius = 170
  const positions: Record<string, { x: number; y: number }> = {}

  if (patternType === 'CYCLE') {
    nodes.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / nodes.length
      positions[n.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
    })
    return positions
  }

  const hub = nodes.find((n) => n.role === 'mule' || n.role === 'origin')
  const others = nodes.filter((n) => n.id !== hub?.id)
  if (hub) positions[hub.id] = { x: centerX, y: centerY }
  others.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(others.length, 1)
    positions[n.id] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
  })
  return positions
}

export function FraudGraphView({ alert }: { alert: Alert }) {
  const [subgraph, setSubgraph] = useState<SubgraphResponse | null>(null)

  useEffect(() => {
    setSubgraph(null)
    apiClient.get<SubgraphResponse>(`/alerts/${alert.id}/subgraph`).then((res) => setSubgraph(res.data))
  }, [alert.id])

  const { nodes, edges } = useMemo<{ nodes: Node[]; edges: Edge[] }>(() => {
    if (!subgraph) return { nodes: [], edges: [] }
    const positions = layout(subgraph.nodes, alert.patternType)
    const nodes: Node[] = subgraph.nodes.map((n) => ({
      id: n.id,
      data: { label: n.label },
      position: positions[n.id] ?? { x: 0, y: 0 },
      style: {
        background: ROLE_COLORS[n.role],
        color: '#0f172a',
        border: '1px solid rgba(0,0,0,0.25)',
        borderRadius: 8,
        padding: 8,
        fontSize: 12,
        fontWeight: 600,
      },
    }))
    const edges: Edge[] = subgraph.edges.map((e, i) => ({
      id: `${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.amount != null ? `${e.amount} ${e.currency ?? ''}`.trim() : undefined,
      animated: true,
      style: { stroke: '#94a3b8' },
      labelStyle: { fill: '#cbd5e1', fontSize: 10 },
    }))
    return { nodes, edges }
  }, [subgraph, alert.patternType])

  return (
    <div className="flex flex-col rounded-lg border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-100">
          {alert.patternType.replace('_', ' ')} — Alert #{alert.id}
        </h3>
        <p className="text-xs text-slate-500">
          {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'just now'}
        </p>
      </div>

      <div style={{ height: 520 }}>
        {subgraph ? (
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Background />
            <Controls />
          </ReactFlow>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading graph...</div>
        )}
      </div>

      <div className="border-t border-slate-800 p-5">
        <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Forensic narrative
        </h4>
        <p className="text-sm text-slate-200">{alert.narrative ?? 'Narrative pending...'}</p>
      </div>
    </div>
  )
}
