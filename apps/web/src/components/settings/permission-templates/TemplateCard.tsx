// cspell:disable
import { Card } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Loader2, Check, Briefcase } from "lucide-react";
import { templateIcons } from "./constants";
import type { Template } from "./types";

interface TemplateCardProps {
  template: Template;
  selectedUser: string;
  isApplying: boolean;
  onApply: () => void;
}

export function TemplateCard({
  template,
  selectedUser,
  isApplying,
  onApply,
}: TemplateCardProps) {
  const Icon = templateIcons[template.icon] || Briefcase;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{template.name}</h4>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {template.module_keys.length} módulos incluídos:
        </p>
        <div className="flex flex-wrap gap-1">
          {template.module_keys.slice(0, 3).map((key) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}
            </Badge>
          ))}
          {template.module_keys.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.module_keys.length - 3}
            </Badge>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        disabled={!selectedUser || isApplying}
        onClick={onApply}
      >
        {isApplying ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Aplicando...
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            Aplicar Template
          </>
        )}
      </Button>
    </Card>
  );
}
