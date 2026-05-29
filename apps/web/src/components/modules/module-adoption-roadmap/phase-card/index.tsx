import { Card } from "@orthoplus/core-ui/card";
import { cn } from "@/lib/utils";
import type { PhaseCardProps } from "./types";
import { PhaseHeader } from "./components/PhaseHeader";
import { ModulesList } from "./components/ModulesList";
import { BenefitsList } from "./components/BenefitsList";

export * from "./types";
export { PhaseHeader, ModulesList, BenefitsList };

export function PhaseCard({
  phase,
  index,
  isFirst,
  onActivate,
}: PhaseCardProps) {
  return (
    <Card
      className={cn(
        "p-6 transition-all hover:shadow-lg",
        isFirst && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="space-y-4">
        <PhaseHeader
          phase={phase}
          index={index}
          isFirst={isFirst}
          onActivate={onActivate}
        />
        <ModulesList modules={phase.modules} />
        <BenefitsList benefits={phase.benefits} />
      </div>
    </Card>
  );
}
