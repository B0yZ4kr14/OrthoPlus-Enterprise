import { CheckCircle2 } from "lucide-react";
import type { BenefitsListProps } from "../types";

export function BenefitsList({ benefits }: BenefitsListProps) {
  if (!benefits || benefits.length === 0) return null;

  return (
    <div>
      <h5 className="text-sm font-semibold mb-2 text-foreground">
        Benefícios esperados:
      </h5>
      <ul className="space-y-1">
        {benefits.map((benefit, index) => (
          <li
            key={index}
            className="text-sm text-muted-foreground flex items-start gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
