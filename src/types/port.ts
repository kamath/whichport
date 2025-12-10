export interface WatchlistEntry {
  id: string
  host: string
  port: number
  endpointPath?: string
  label?: string
  createdAt: number
}

export interface PortStatus {
  id: string
  status: 'active' | 'inactive' | 'checking' | 'unknown'
  pageTitle?: string
  lastChecked: number
  responseTime?: number
  error?: string
  httpStatus?: number
}
