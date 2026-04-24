// cspell:disable
import { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import type { AuditLog } from "./types";

export function useAuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);

      if (!user) return;

      const data = await apiClient.get<Record<string, unknown>[]>(
        "/configuracoes/permissoes/audit",
        { params: { limit: 100 } }
      );

      const moduleIds =
        data?.map((log) => log.module_catalog_id).filter(Boolean) || [];
      let modulesMap: Record<number, unknown> = {};

      if (moduleIds.length > 0) {
        const modulesData = await apiClient.get<Record<string, unknown>[]>(
          "/configuracoes/modulos",
          { params: { ids: moduleIds.join(",") } }
        );

        if (modulesData) {
          modulesMap = Object.fromEntries(modulesData.map((m) => [m.id, m]));
        }
      }

      const processedLogs =
        data?.map((log) => ({
          id: String(log.id || ""),
          created_at: String(log.created_at || ""),
          action: String(log.action || ""),
          template_name: log.template_name ? String(log.template_name) : null,
          details: (log.details as Record<string, unknown>) || {},
          user: {
            full_name:
              (log.user as Record<string, unknown>)?.full_name?.[0]?.full_name ||
              "Desconhecido",
          },
          target_user: {
            full_name:
              (log.target_user as Record<string, unknown>)?.full_name?.[0]
                ?.full_name || "Desconhecido",
          },
          module: log.module_catalog_id
            ? modulesMap[log.module_catalog_id as number]
            : undefined,
        })) || [];

      setLogs(processedLogs);
    } catch (error) {
      logger.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterUser !== "all" && log.target_user.full_name !== filterUser)
        return false;
      if (filterAction !== "all" && log.action !== filterAction) return false;
      return true;
    });
  }, [logs, filterUser, filterAction]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.target_user.full_name)));
  }, [logs]);

  return {
    logs,
    loading,
    filteredLogs,
    filterUser,
    setFilterUser,
    filterAction,
    setFilterAction,
    uniqueUsers,
  };
}
