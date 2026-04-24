import { useState, useEffect } from "react";
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${backend.url}/health`, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;

        return {
          ...backend,
          status: response.ok ? "online" : "offline",
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
