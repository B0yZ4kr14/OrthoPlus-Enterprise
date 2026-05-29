// cspell:disable
export interface Module {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies?: string[];
  blocking_dependents?: string[];
}

import type {
  Recommendation,
  ClinicProfile,
} from "@/components/modules/module-adoption-roadmap/types";

export interface RoadmapData {
  recommendation?: Recommendation;
  clinic_profile?: ClinicProfile;
}

export interface ModulesSimpleState {
  modules: Module[];
  loading: boolean;
  toggling: string | null;
  showPreview: boolean;
  showWizard: boolean;
  showRoadmap: boolean;
  expandedModule: string | null;
  roadmapData: RoadmapData | null;
  loadingRoadmap: boolean;
}
