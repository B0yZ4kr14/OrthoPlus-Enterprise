// cspell:disable
import { Settings, MapIcon, Sparkles, Eye, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@orthoplus/core-ui/button";

interface ModulesHeaderProps {
  showPreview: boolean;
  loadingRoadmap: boolean;
  onTogglePreview: () => void;
  onShowWizard: () => void;
  onLoadRoadmap: () => void;
}

export function ModulesHeader({
  showPreview,
  loadingRoadmap,
  onTogglePreview,
  onShowWizard,
  onLoadRoadmap,
}: ModulesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <PageHeader
        icon={Settings}
        title="Gestão de Módulos"
        description="Ative ou desative módulos do sistema"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onLoadRoadmap}
          disabled={loadingRoadmap}
          className="gap-2"
        >
          {loadingRoadmap ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapIcon className="h-4 w-4" />
          )}
          Roadmap de Adoção
        </Button>

        <Button
          variant="outline"
          onClick={onShowWizard}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Assistente de Configuração
        </Button>

        <Button
          variant={showPreview ? "default" : "outline"}
          onClick={onTogglePreview}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? "Ocultar" : "Visualizar"} Menu
        </Button>
      </div>
    </div>
  );
}
