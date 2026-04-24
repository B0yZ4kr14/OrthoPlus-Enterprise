import { Card } from "@orthoplus/core-ui/card";
import { CheckCircle2 } from "lucide-react";
import { RESOURCES } from "./useStepExport";

export function ResourcesCard() {
  return (
    <Card className="p-6 bg-muted/50">
      <h3 className="font-semibold mb-3">📚 Recursos Úteis</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {RESOURCES.map((resource) => (
          <li key={resource.title} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              <strong>{resource.title}:</strong> {resource.description}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
