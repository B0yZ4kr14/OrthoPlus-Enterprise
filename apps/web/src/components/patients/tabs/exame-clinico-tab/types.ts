// cspell:disable

export interface Patient {
  main_complaint?: string;
  pain_level?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  blood_type?: string;
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  oral_hygiene_quality?: string;
  gum_condition?: string;
  clinical_observations?: string;
}

export interface BMICategory {
  label: string;
  color: string;
}

export interface BPStatus {
  label: string;
  color: string;
}
