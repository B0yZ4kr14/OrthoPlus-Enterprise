import { useMemoryHubHealth } from "../hooks/useMemoryHubHealth"

export function MemoryHubHealth() {
  const { metrics, loading, error, refresh } = useMemoryHubHealth()

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground" data-testid="health-loading">Loading health metrics...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" data-testid="health-error">
        {error}
        <button onClick={refresh} className="ml-2 underline">Retry</button>
      </div>
    )
  }

  if (!metrics) {
    return <div className="p-4 text-sm text-muted-foreground">No health data available</div>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-lg border p-4" data-testid="metric-documents">
        <div className="text-2xl font-bold">{metrics.totalDocuments}</div>
        <div className="text-sm text-muted-foreground">Indexed Documents</div>
      </div>
      <div className="rounded-lg border p-4" data-testid="metric-coverage">
        <div className="text-2xl font-bold">{metrics.coveragePercent}%</div>
        <div className="text-sm text-muted-foreground">Coverage</div>
      </div>
      <div className="rounded-lg border p-4" data-testid="metric-drift">
        <div className="text-2xl font-bold">{metrics.driftCount}</div>
        <div className="text-sm text-muted-foreground">Drift Issues</div>
      </div>
    </div>
  )
}
