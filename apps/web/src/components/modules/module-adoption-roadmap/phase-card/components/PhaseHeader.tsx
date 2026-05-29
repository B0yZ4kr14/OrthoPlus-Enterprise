import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import { Clock, CheckCircle2 } from "lucide-react";
import { PhaseNumber } from "./PhaseNumber";
import type { Phase, PhaseCardProps } from "../types";

type PhaseHeaderProps = Pick<
  PhaseCardProps,
  "phase" | "index" | "isFirst" | "onActivate"
>;

export function PhaseHeader({
  phase,
  index,
  isFirst,
  onActivate,
}: PhaseHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 flex-1">
        <PhaseNumber index={index} isFirst={isFirst} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-lg text-foreground">{phase.name}</h4>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {phase.timeline}
            </Badge>
            {isFirst && (
              <Badge variant="default" className="bg-primary">
                Prioridade
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{phase.rationale}</p>
        </div>
      </div>

      {onActivate && (
        <Button
          variant={isFirst ? "default" : "outline"}
          size="sm"
          onClick={() => onActivate(phase.modules)}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Ativar Fase
        </Button>
      )}
    </div>
  );
}
