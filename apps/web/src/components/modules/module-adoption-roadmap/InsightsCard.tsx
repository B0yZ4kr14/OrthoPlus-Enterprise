import { Card } from "@orthoplus/core-ui/card";
import { CheckCircle2 } from "lucide-react";

interface InsightsCardProps {
  insights: string;
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <Card className="p-4 bg-muted/30">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-success" />
        Análise do Perfil
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {insights}
      </p>
    </Card>
  );
}
