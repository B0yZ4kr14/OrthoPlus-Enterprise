import { TrendingUp } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";
import { PROCESS_STEPS } from "./types";

export function ProcessSteps() {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Como Funciona o Recebimento
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {PROCESS_STEPS.map((item) => (
          <div
            key={item.step}
            className="text-center p-3 bg-background rounded-lg border"
          >
            <Badge className="mb-2">{item.step}</Badge>
            <p className="text-sm font-semibold mb-1">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
