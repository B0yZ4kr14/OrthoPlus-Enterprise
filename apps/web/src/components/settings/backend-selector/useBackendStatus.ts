import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import type { BackendConfig } from "./types";

export function useBackendStatus() {
  const [backend, setBackend] = useState<BackendConfig>({
    type: "ubuntu-server",
    url: import.meta.env.VITE_API_BASE_URL || "http://localhost:3005",
    status: "checking",
    latency: null,
  });

  /* eslint-disable react-hooks/exhaustive-deps -- data-fetching functions capture deps from closure */
  useEffect(() => {
    const checkBackendStatus = async (): Promise<BackendConfig> => {
      const startTime = Date.now();

      try {
        await apiClient.get("/health", { timeout: 5000 });
        const latency = Date.now() - startTime;

        return {
          ...backend,
          status: "online",
          latency,
        };
      } catch {
        return {
          ...backend,
          status: "offline",
          latency: null,
        };
      }
    };

    const checkStatus = async () => {
      const status = await checkBackendStatus();
      setBackend(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return backend;
}
