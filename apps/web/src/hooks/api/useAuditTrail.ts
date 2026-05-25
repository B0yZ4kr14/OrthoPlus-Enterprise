import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/apiClient"

export interface AuditTrailLog {
  id: number
  timestamp: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: unknown
  new_values: unknown
  sensitivity_level: string
}

export const useAuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [sensitivityFilter, setSensitivityFilter] = useState<string>("all")

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-trail", actionFilter, sensitivityFilter],
    queryFn: async () => {
      const queryParams: Record<string, string> = { limit: "1000" }
      if (actionFilter !== "all") queryParams.action = actionFilter
      if (sensitivityFilter !== "all") queryParams.sensitivity_level = sensitivityFilter

      const data = await apiClient.get<AuditTrailLog[]>("/admin/audit-trail", {
        params: queryParams,
      })
      return Array.isArray(data) ? data : []
    },
  })

  const filteredLogs = logs.filter(
    (log) =>
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return {
    logs,
    filteredLogs,
    isLoading,
    searchTerm,
    setSearchTerm,
    actionFilter,
    setActionFilter,
    sensitivityFilter,
    setSensitivityFilter,
  }
}
