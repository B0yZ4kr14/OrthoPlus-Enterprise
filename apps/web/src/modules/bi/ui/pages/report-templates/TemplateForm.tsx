import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Textarea } from "@orthoplus/core-ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Switch } from "@orthoplus/core-ui/switch";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@orthoplus/core-ui/tabs";
import { Plus, Check } from "lucide-react";
import type { ReportTemplate, TemplateFormData } from "./types";
import {
  AVAILABLE_METRICS,
  TEMPLATE_CATEGORIES,
  LAYOUT_OPTIONS,
} from "./types";

interface TemplateFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTemplate: ReportTemplate | null;
  formData: TemplateFormData;
  onFormChange: (data: TemplateFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  toggleMetric: (metricId: string) => void;
}

export function TemplateForm({
  isOpen,
  onOpenChange,
  editingTemplate,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  toggleMetric,
}: TemplateFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => onCancel()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? "Editar Template" : "Criar Novo Template"}
          </DialogTitle>
          <DialogDescription>
            Configure as métricas, filtros e layout do seu relatório
            personalizado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    onFormChange({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Relatório Financeiro Mensal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    onFormChange({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o objetivo deste template..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="space-y-2">
                <Label>Métricas Disponíveis</Label>
                <p className="text-sm text-muted-foreground">
                  Selecione as métricas que serão exibidas no relatório
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_METRICS.map((metric) => (
                    <button
                      key={metric.id}
                      type="button"
                      onClick={() => toggleMetric(metric.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.metrics.includes(metric.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{metric.label}</p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {
                              TEMPLATE_CATEGORIES.find(
                                (c) => c.value === metric.category,
                              )?.label
                            }
                          </Badge>
                        </div>
                        {formData.metrics.includes(metric.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="layout">Tipo de Layout</Label>
                <Select
                  value={formData.layout}
                  onValueChange={(value) =>
                    onFormChange({ ...formData, layout: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUT_OPTIONS.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTemplate ? "Atualizar" : "Criar"} Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
