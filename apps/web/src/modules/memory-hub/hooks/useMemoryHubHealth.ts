import { useState, useEffect } from "react"
import { HealthMetrics } from "../types"

interface UseMemoryHubHealthReturn {
  metrics: HealthMetrics | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMemoryHubHealth(): UseMemoryHubHealthReturn {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/memory-hub/health")
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      const data = await response.json()
      setMetrics({
        totalDocuments: data.totalDocuments || 0,
        coveragePercent: data.coveragePercent || 0,
        driftCount: data.driftCount || 0,
        lastScan: data.lastScan || new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Health check failed")
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { metrics, loading, error, refresh }
}
