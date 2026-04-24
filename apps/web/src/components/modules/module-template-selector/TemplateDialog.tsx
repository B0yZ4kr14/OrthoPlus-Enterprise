import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import { Button } from "@orthoplus/core-ui/button";
import { Sparkles } from "lucide-react";
import type { Template } from "./types";
import { TemplateCard } from "./TemplateCard";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  applying: string | null;
  onApply: (id: string, name: string) => void;
}

export function TemplateDialog({
  open,
  onOpenChange,
  templates,
  applying,
  onApply,
}: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          Templates por Especialidade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Templates de Configuração por Especialidade
          </DialogTitle>
          <DialogDescription>
            Escolha um template pré-configurado baseado na especialidade da sua
            clínica. Todos os módulos necessários serão ativados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isApplying={applying === template.id}
              onApply={onApply}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
