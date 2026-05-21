import { apiClient } from "@/lib/api/apiClient";
import { useCallback, useState } from "react";

export interface AuditLogEntry {
  id: string;
  analise_id: string | null;
  clinic_id: string;
  paciente_id: string;
  dentista_id: string;
  acao: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  detalhes: Record<string, unknown> | null;
}

export const useAuditTrail = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditTrail = useCallback(async (analiseId: string) => {
    try {
      setLoading(true);
      const result = await apiClient.get<AuditLogEntry[]>(
        `/ia-radiografia/analises/${analiseId}/audit`,
      );
      setLogs(result || []);
    } catch (error) {
      console.error("Erro ao carregar auditoria:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, fetchAuditTrail };
};
