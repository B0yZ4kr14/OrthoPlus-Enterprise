import { Badge } from "@orthoplus/core-ui/badge";
import type { ModulesListProps } from "../types";

export function ModulesList({ modules }: ModulesListProps) {
  return (
    <div>
      <h5 className="text-sm font-semibold mb-2 text-foreground">
        Módulos desta fase:
      </h5>
      <div className="flex flex-wrap gap-2">
        {modules.map((module, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {module}
          </Badge>
        ))}
      </div>
    </div>
  );
}
