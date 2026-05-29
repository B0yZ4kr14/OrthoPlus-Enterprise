import { Card } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Button } from "@orthoplus/core-ui/button";
import type { NextStep } from "./types";

interface NextStepCardProps {
  step: NextStep;
}

export function NextStepCard({ step }: NextStepCardProps) {
  const Icon = step.icon;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{step.title}</h4>
            <Badge variant="secondary" className="text-xs">
              {step.badge}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {step.description}
          </p>
          <Button variant="outline" size="sm">
            {step.action}
          </Button>
        </div>
      </div>
    </Card>
  );
}
