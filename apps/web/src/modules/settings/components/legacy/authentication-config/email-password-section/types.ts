import type { AuthConfig } from "../types";

export type { AuthConfig };

export interface EmailPasswordSectionProps {
  config: AuthConfig;
  onUpdate: (updates: Partial<AuthConfig>) => void;
}

export interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface PasswordRequirementProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}
