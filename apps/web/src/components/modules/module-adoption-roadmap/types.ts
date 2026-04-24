export interface Phase {
  name: string;
  timeline: string;
  modules: string[];
  rationale: string;
  benefits: string[];
}

export interface Recommendation {
  phases: Phase[];
  insights: string;
}

export interface ClinicProfile {
  patient_count: number;
  days_since_creation: number;
  active_modules_count: number;
  inactive_modules_count: number;
}

export interface ModuleAdoptionRoadmapProps {
  recommendation: Recommendation;
  clinicProfile?: ClinicProfile;
  onActivatePhase?: (modules: string[]) => void;
}
