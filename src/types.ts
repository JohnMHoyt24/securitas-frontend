export interface Alert {
  id: number
  patternType: 'CYCLE' | 'FAN_IN' | 'FAN_OUT'
  subgraphJson: string
  fingerprint: string
  narrative: string | null
  status: 'NEW' | 'REVIEWING' | 'CLOSED'
  createdAt: string | null
}

export interface AuthUser {
  username: string
  role: 'ANALYST' | 'ADMIN'
}

export interface SubgraphNode {
  id: string
  label: string
  role: 'origin' | 'mule' | 'destination' | 'cycle'
}

export interface SubgraphEdge {
  source: string
  target: string
  type: string
  amount: number | null
  currency: string | null
}

export interface SubgraphResponse {
  nodes: SubgraphNode[]
  edges: SubgraphEdge[]
}
