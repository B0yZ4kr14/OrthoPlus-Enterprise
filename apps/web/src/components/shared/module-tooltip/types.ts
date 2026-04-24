// cspell:disable
export interface ModuleTooltipProps {
  moduleKey: string;
  children?: React.ReactNode;
  variant?: "icon" | "inline";
}

export interface ModuleInfo {
  name: string;
  category: string;
  description: string;
  dependencies?: string[];
  benefits: string[];
}
