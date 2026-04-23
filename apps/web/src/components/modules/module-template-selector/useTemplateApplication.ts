import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useToast } from "@/hooks/use-toast";

interface UseTemplateApplicationProps {
  onSuccess?: () => void;
}

export function useTemplateApplication({ onSuccess }: UseTemplateApplicationProps = {}) {
  const { toast } = useToast();
  const [applying, setApplying] = useState<string | null>(null);

  const applyTemplate = useCallback(
    async (templateId: string, templateName: string) => {
      setApplying(templateId);
      try {
        const data = await apiClient.post<{ activated: number }>(
          "/modules/apply-template",
          { template_id: templateId },
        );

        toast({
          title: "Template aplicado!",
          description: `${data.activated} módulos ativados com sucesso.`,
        });

        onSuccess?.();
        return true;
      } catch (error: unknown) {
        const _e = error instanceof Error ? error : { message: String(error) };
        logger.error("Error applying template:", error);
        toast({
          title: "Erro ao aplicar template",
          description: _e.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
        return false;
      } finally {
        setApplying(null);
      }
    },
    [onSuccess, toast],
  );

  return { applyTemplate, applying };
}
