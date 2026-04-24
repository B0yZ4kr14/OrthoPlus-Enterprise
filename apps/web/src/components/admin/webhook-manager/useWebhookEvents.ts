import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { GitHubEvent } from "./types";

export function useWebhookEvents() {
  const { selectedClinic } = useAuth();
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!selectedClinic) return;

    setLoading(true);
    try {
      const data = await apiClient.get<GitHubEvent[]>("/admin/github-events", {
        params: { limit: 20 },
      });
      setEvents(data || []);
    } catch (error) {
      logger.error("Erro ao carregar eventos:", error);
      toast.error("Erro ao carregar eventos de webhook");
    } finally {
      setLoading(false);
    }
  }, [selectedClinic]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { events, loading, refetch: loadEvents };
}
