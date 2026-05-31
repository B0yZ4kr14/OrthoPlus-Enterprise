import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { format } from "@/lib/utils/date.utils.ts";
import { ptBR } from "date-fns/locale";

export interface AuditLog {
  id: number;
  created_at: string;
  user_id: string;
  clinic_id: string;
  action: string;
  details: Record<string, unknown>;
  target_module_id: number | null;
  profiles?: { full_name: string | null } | null;
}

export interface AuditUser {
  id: string;
  full_name: string | null;
}

export const useAuditLogs = (
  clinicId: string | undefined,
  isAdmin: boolean,
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  const { data: users = [] } = useQuery<AuditUser[]>({
    queryKey: ["usuarios", clinicId],
    queryFn: async () => {
      const data = await apiClient.get<AuditUser[]>("/usuarios");
      return Array.isArray(data) ? data : [];
    },
    enabled: isAdmin && !!clinicId,
  });

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: [
      "audit-logs",
      clinicId,
      selectedUser,
      selectedAction,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      if (!clinicId) return [];
      const params = new URLSearchParams();
      if (selectedUser !== "all") params.append("user_id", selectedUser);
      if (selectedAction !== "all") params.append("action", selectedAction);
      if (dateFrom) params.append("from", dateFrom.toISOString());
      if (dateTo) params.append("to", dateTo.toISOString());

      const data = await apiClient.get<AuditLog[]>(
        `/db/audit_logs?${params.toString()}`,
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: isAdmin && !!clinicId,
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedUser("all");
    setSelectedAction("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const exportLogs = () => {
    const csvContent = [
      ["Data/Hora", "Usuário", "Ação", "Detalhes"].join(","),
      ...logs.map((log) =>
        [
          format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", {
            locale: ptBR,
          }),
          log.profiles?.full_name ||
            users.find((u) => u.id === log.user_id)?.full_name ||
            log.user_id,
          log.action,
          JSON.stringify(log.details),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${Date.now()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Logs exportados com sucesso!");
  };

  return {
    logs,
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedAction,
    setSelectedAction,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    handleClearFilters,
    exportLogs,
  };
};
