// cspell:disable
import { Badge } from "@orthoplus/core-ui/badge";
import type { ModuleInfo } from "./types";

interface TooltipContentProps {
  data: ModuleInfo;
}

export function TooltipContentView({ data }: TooltipContentProps) {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-semibold text-base">{data.name}</h4>
        <Badge variant="outline" className="mt-1 text-xs">
          {data.category}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {data.description}
      </p>

      {data.dependencies && data.dependencies.length > 0 && (
        <div>
          <p className="text-xs font-medium mb-1.5 text-foreground/80">
            Depende de:
          </p>
          <div className="flex flex-wrap gap-1">
            {data.dependencies.map((dep) => (
              <Badge key={dep} variant="secondary" className="text-xs">
                {dep}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium mb-2 text-foreground/80">
          Benefícios:
        </p>
        <ul className="text-xs space-y-1.5">
          {data.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-success mt-0.5 shrink-0">✓</span>
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
