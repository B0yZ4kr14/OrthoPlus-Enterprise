import type {
  Building,
  Stethoscope,
  Activity,
  Zap,
  Baby,
  Sparkles,
  Rocket,
} from "lucide-react";

export interface Template {
  id: string;
  name: string;
  specialty: string;
  description: string;
  icon: string;
  modules: string[];
}

export interface ModuleTemplateSelectorProps {
  onApply?: () => void;
}

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building,
  Stethoscope,
  Activity,
  Zap,
  Baby,
  Sparkles,
  Rocket,
};
