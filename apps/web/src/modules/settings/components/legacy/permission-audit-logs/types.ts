// cspell:disable

export interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  template_name: string | null;
  details: Record<string, unknown>;
  user: {
    full_name: string;
  };
  target_user: {
    full_name: string;
  };
  module?: {
    name: string;
  };
}

export type ActionVariant = "success" | "destructive" | "default";

export interface ActionConfig {
  label: string;
  variant: ActionVariant;
}
