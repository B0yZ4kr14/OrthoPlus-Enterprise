import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Gauge } from "lucide-react";
import type { MemoryMetrics } from "./types";

interface MemoryCardProps {
  memory: MemoryMetrics;
}

function getMemoryColor(usage: string): "default" | "secondary" | "warning" | "destructive" {
  const percent = parseFloat(usage);
  if (percent < 60) return "success" as unknown as "default";
  if (percent < 80) return "warning";
  return "destructive";
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gauge className="h-4 w-4" />
          Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Used:</span>
          <span className="font-mono">{memory.usedJSHeapSize}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-mono">{memory.totalJSHeapSize}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Usage:</span>
          <Badge variant={getMemoryColor(memory.usage)}>{memory.usage}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
