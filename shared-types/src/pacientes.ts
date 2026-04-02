/**
 * Pacientes (Patients) Module Types
 */

export interface Patient {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  gender?: "M" | "F" | "O" | "N";
  maritalStatus?: MaritalStatus;
  address?: Address;
  emergencyContact?: EmergencyContact;
  healthInfo?: HealthInfo;
  dentalHistory?: DentalHistory;
  avatarUrl?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  lastVisit?: string;
}

export type MaritalStatus = 
  | "single" 
  | "married" 
  | "divorced" 
  | "widowed" 
  | "separated";

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface HealthInfo {
  bloodType?: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  previousSurgeries: string[];
  isPregnant?: boolean;
  pregnancyWeeks?: number;
}

export interface DentalHistory {
  previousTreatments: string[];
  currentPain: boolean;
  painLocation?: string;
  sensitivity: boolean;
  bleedingGums: boolean;
  badBreath: boolean;
  teethGrinding: boolean;
}

export interface CreatePatientRequest {
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  gender?: "M" | "F" | "O" | "N";
  address?: Address;
  emergencyContact?: EmergencyContact;
  healthInfo?: Partial<HealthInfo>;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  id: string;
}

export interface PatientListFilters {
  search?: string;
  active?: boolean;
  hasAppointment?: boolean;
  lastVisitFrom?: string;
  lastVisitTo?: string;
}
