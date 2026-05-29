import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Loader2, Sparkles, CheckCircle2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Template } from "./types";
import { ICON_MAP } from "./types";

interface TemplateCardProps {
  template: Template;
  isApplying: boolean;
  onApply: (id: string, name: string) => void;
}

export function TemplateCard({
  template,
  isApplying,
  onApply,
}: TemplateCardProps) {
  const Icon = ICON_MAP[template.icon] || Stethoscope;

  return (
    <Card
      variant="elevated"
      className={cn(
        "transition-all hover:shadow-xl hover:-translate-y-1",
        isApplying && "opacity-60",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {template.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span>{template.modules.length} módulos inclusos</span>
        </div>

        <Button
          onClick={() => onApply(template.id, template.name)}
          disabled={isApplying}
          className="w-full gap-2"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Aplicando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Aplicar Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
