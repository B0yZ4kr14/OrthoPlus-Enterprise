import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Switch } from "@orthoplus/core-ui/switch";
import { Edit, Trash2, Copy, FileText } from "lucide-react";
import type { ReportTemplate } from "./types";
import { TEMPLATE_CATEGORIES } from "./types";

interface TemplatesListProps {
  templates: ReportTemplate[];
  onEdit: (template: ReportTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: ReportTemplate) => void;
  onToggleActive: (id: string) => void;
}

export function TemplatesList({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}: TemplatesListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum template criado</h3>
        <p className="text-muted-foreground">
          Crie seu primeiro template de relatório personalizado
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {template.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </div>
              <Switch
                checked={template.is_active}
                onCheckedChange={() => onToggleActive(template.id)}
                className="ml-2"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {TEMPLATE_CATEGORIES.find(
                    (c) => c.value === template.category,
                  )?.label || template.category}
                </Badge>
                <Badge variant="outline">
                  {template.metrics.length} métricas
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(template)}
                  aria-label="Editar template"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicate(template)}
                  aria-label="Duplicar template"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(template.id)}
                  className="text-destructive hover:text-destructive"
                  aria-label="Excluir template"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
