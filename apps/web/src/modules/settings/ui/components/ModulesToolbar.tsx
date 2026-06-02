import React from "react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orthoplus/core-ui/dialog";
import {
  BookOpen,
  Download,
  Upload,
  Sparkles,
  Network,
  Loader2,
} from "lucide-react";
import { ModuleTemplateSelector } from "@/components/modules/ModuleTemplateSelector";

interface ModulesToolbarProps {
  onOpenOnboarding: () => void;
  onExportConfig: () => void;
  onImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGetSuggestions: () => void;
  loadingSuggestions: boolean;
  onRefresh: () => void;
}

export function ModulesToolbar({
  onOpenOnboarding,
  onExportConfig,
  onImportConfig,
  onGetSuggestions,
  loadingSuggestions,
  onRefresh,
}: ModulesToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button"
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={onOpenOnboarding}
      >
        <BookOpen className="h-5 w-5" />
        Guia de Onboarding
      </Button>

      <ModuleTemplateSelector onApply={onRefresh} />

      <Button type="button"
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={onGetSuggestions}
        disabled={loadingSuggestions}
      >
        {loadingSuggestions ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        Sugestões IA
      </Button>

      <Button type="button"
        variant="outline"
        size="lg"
        className="gap-2"
        onClick={onExportConfig}
      >
        <Download className="h-5 w-5" />
        Exportar Config
      </Button>

      <label htmlFor="import-config">
        <input
          type="file"
          accept=".json"
          onChange={onImportConfig}
          className="hidden"
          id="import-config"
          title="Selecione arquivo JSON de configuração"
        />
        <Button type="button"
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => document.getElementById("import-config")?.click()}
          asChild
        >
          <span>
            <Upload className="h-5 w-5" />
            Importar Config
          </span>
        </Button>
      </label>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2">
            <Network className="h-5 w-5" />
            Grafo de Dependências
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Grafo de Dependências dos Módulos
            </DialogTitle>
            <DialogDescription>
              Visualização interativa das dependências entre os módulos. Use os
              controles para zoom e navegação.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[calc(90vh-120px)]">
            <div className="text-center text-muted-foreground p-8">
              Grafo de dependências em desenvolvimento
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
