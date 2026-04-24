// cspell:disable
import { memo } from "react";
import { Loader2, MapIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@orthoplus/core-ui/dialog";
import { cn } from "@/lib/utils";
import { SidebarPreview } from "@/components/modules/SidebarPreview";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ModuleAdoptionRoadmap } from "@/components/modules/ModuleAdoptionRoadmap";
import { useModulesSimple } from "./useModulesSimple";
import { ModulesHeader } from "./ModulesHeader";
import { ModulesList } from "./ModulesList";

const ModulesSimple = memo(function ModulesSimple() {
  const {
    modules,
    loading,
    toggling,
    showPreview,
    showWizard,
    showRoadmap,
    expandedModule,
    roadmapData,
    loadingRoadmap,
    groupedModules,
    sortedCategories,
    setShowPreview,
    setShowWizard,
    setShowRoadmap,
    handleToggle,
    handleLoadRoadmap,
    handleActivatePhase,
    handleWizardActivate,
    toggleExpandedModule,
  } = useModulesSimple();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando módulos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      <ModulesHeader
        showPreview={showPreview}
        loadingRoadmap={loadingRoadmap}
        onTogglePreview={() => setShowPreview(!showPreview)}
        onShowWizard={() => setShowWizard(true)}
        onLoadRoadmap={handleLoadRoadmap}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={cn(
            "space-y-8",
            showPreview ? "lg:col-span-2" : "lg:col-span-3",
          )}
        >
          <ModulesList
            categories={sortedCategories}
            groupedModules={groupedModules}
            allModules={modules}
            toggling={toggling}
            expandedModule={expandedModule}
            onToggle={handleToggle}
            onExpand={toggleExpandedModule}
          />
        </div>

        {showPreview && (
          <div className="lg:col-span-1 sticky top-8 h-fit">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Preview do Menu
              </h3>
              <SidebarPreview modules={modules} />
            </div>
          </div>
        )}
      </div>

      {showWizard && (
        <OnboardingWizard
          open={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={() => setShowWizard(false)}
        />
      )}

      <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="h-5 w-5" />
              Roadmap Inteligente de Adoção de Módulos
            </DialogTitle>
            <DialogDescription>
              Sequência recomendada baseada em análise IA do perfil e padrões de
              clínicas bem-sucedidas
            </DialogDescription>
          </DialogHeader>

          {roadmapData && (
            <ModuleAdoptionRoadmap
              recommendation={roadmapData.recommendation as any}
              clinicProfile={roadmapData.clinic_profile as any}
              onActivatePhase={handleActivatePhase}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ModulesSimple;
