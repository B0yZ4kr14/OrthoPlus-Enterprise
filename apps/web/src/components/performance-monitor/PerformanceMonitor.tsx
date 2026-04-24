import { usePerformanceMetrics } from "./usePerformanceMetrics";
import { FPSCard } from "./FPSCard";
import { MemoryCard } from "./MemoryCard";
import { CacheCard } from "./CacheCard";
import { DevBadge } from "./DevBadge";

export function PerformanceMonitor() {
  const { memory, cacheMetrics, fps, isDev } = usePerformanceMetrics();

  if (!isDev) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-xs">
      <FPSCard fps={fps} />
      {memory && <MemoryCard memory={memory} />}
      {cacheMetrics.size > 0 && <CacheCard cacheMetrics={cacheMetrics} />}
      <DevBadge />
    </div>
  );
}
