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
