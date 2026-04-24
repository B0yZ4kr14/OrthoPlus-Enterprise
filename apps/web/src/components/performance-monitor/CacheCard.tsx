import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Database } from "lucide-react";

interface CacheCardProps {
  cacheMetrics: Map<string, { hitRate: number }>;
}

export function CacheCard({ cacheMetrics }: CacheCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Cache
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from(cacheMetrics.entries()).map(([name, metrics]) => (
          <div key={name} className="space-y-1">
            <div className="text-xs font-semibold">{name}</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hit Rate:</span>
              <Badge variant="outline">{metrics.hitRate.toFixed(1)}%</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
