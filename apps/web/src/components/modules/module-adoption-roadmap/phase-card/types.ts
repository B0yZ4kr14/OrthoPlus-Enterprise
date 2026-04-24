import type { Phase } from "../types";

export type { Phase };

export interface PhaseCardProps {
  phase: Phase;
  index: number;
  isFirst: boolean;
  onActivate?: (modules: string[]) => void;
}

export interface PhaseNumberProps {
  index: number;
  isFirst: boolean;
}

export interface ModulesListProps {
  modules: string[];
}

export interface BenefitsListProps {
  benefits: string[];
}
