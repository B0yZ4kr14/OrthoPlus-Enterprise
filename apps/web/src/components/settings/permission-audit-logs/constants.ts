// cspell:disable
import type { ActionConfig } from "./types";

export const ACTION_LABELS: Record<string, ActionConfig> = {
  PERMISSION_GRANTED: { label: "Permissão Concedida", variant: "success" },
  PERMISSION_REVOKED: { label: "Permissão Revogada", variant: "destructive" },
  TEMPLATE_APPLIED: { label: "Template Aplicado", variant: "default" },
};
