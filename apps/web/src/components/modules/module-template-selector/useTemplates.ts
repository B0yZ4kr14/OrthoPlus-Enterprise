import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";
import { apiClient } from "@/lib/api/apiClient";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "./types";

export function useTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    try {
      const data = await apiClient.get<Record<string, unknown>[]>(
        "/module_configuration_templates?is_active=eq.true&order=name",
      );

      const processedTemplates = (data || []).map((template) => ({
        ...template,
        modules: Array.isArray(template.modules)
          ? (template.modules as string[])
          : [],
      })) as Template[];

      setTemplates(processedTemplates);
    } catch (error) {
      logger.error("Error fetching templates:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, refetch: fetchTemplates };
}
