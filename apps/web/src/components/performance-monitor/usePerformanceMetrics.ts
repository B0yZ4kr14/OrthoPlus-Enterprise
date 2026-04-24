import { useEffect, useState } from "react";
import { monitorMemoryUsage, getAllCacheMetrics } from "@/lib/performance";
import type { MemoryMetrics } from "./types";

export function usePerformanceMetrics() {
  const [memory, setMemory] = useState<MemoryMetrics | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState(getAllCacheMetrics());
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const memoryInterval = setInterval(() => {
      setMemory(monitorMemoryUsage());
      setCacheMetrics(getAllCacheMetrics());
    }, 2000);

    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frames * 1000) / (currentTime - lastTime)));
        frames = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return { memory, cacheMetrics, fps, isDev: import.meta.env.DEV };
}
