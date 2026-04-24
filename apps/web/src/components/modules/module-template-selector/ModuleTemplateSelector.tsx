import { useState, useCallback } from "react";
import { useTemplates } from "./useTemplates";
import { useTemplateApplication } from "./useTemplateApplication";
import { TemplateDialog } from "./TemplateDialog";
import { LoadingState } from "./LoadingState";
import type { ModuleTemplateSelectorProps } from "./types";

export function ModuleTemplateSelector({ onApply }: ModuleTemplateSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { templates, loading } = useTemplates();
  const { applyTemplate, applying } = useTemplateApplication({
    onSuccess: () => {
      setDialogOpen(false);
      onApply?.();
    },
  });

  const handleApply = useCallback(
    async (templateId: string, templateName: string) => {
      const success = await applyTemplate(templateId, templateName);
      if (success) {
        setDialogOpen(false);
      }
    },
    [applyTemplate],
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <TemplateDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      templates={templates}
      applying={applying}
      onApply={handleApply}
    />
  );
}
