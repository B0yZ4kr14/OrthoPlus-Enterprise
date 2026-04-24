import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Zap } from "lucide-react";

interface FPSCardProps {
  fps: number;
}

function getFPSColor(fps: number): string {
  if (fps >= 55) return "text-green-500";
  if (fps >= 30) return "text-yellow-500";
  return "text-red-500";
}

export function FPSCard({ fps }: FPSCardProps) {
  return (
    <Card className="backdrop-blur-xl bg-background/90 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">FPS:</span>
          <Badge variant="outline" className={getFPSColor(fps)}>
            {fps}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
