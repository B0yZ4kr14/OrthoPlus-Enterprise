// cspell:disable
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import type { Procedimento } from "./types";

export function useProcedimentos() {
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcedimentos = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<Procedimento[]>("/procedimentos");
        setProcedimentos(response || []);
      } catch (error) {
        logger.error("Erro ao carregar procedimentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcedimentos();
  }, []);

  return { procedimentos, loading };
}
