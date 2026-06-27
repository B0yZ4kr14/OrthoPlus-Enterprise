import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { ExportFormat } from "./types";

export function useBackupExport() {
  const { clinicId } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await apiClient.post<unknown>("/modules/export-data", {
        clinic_id: clinicId,
        format: selectedFormat,
      });

      const blob = new Blob([JSON.stringify(data)], {
        type: selectedFormat === "json" ? "application/json" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.${selectedFormat}`;
      a.click();

      toast.success("Exportação concluída com sucesso");
    } catch (error) {
      logger.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  }, [clinicId, selectedFormat]);

  return {
    isExporting,
    selectedFormat,
    setSelectedFormat,
    handleExport,
  };
}
