// import type { Patient } from "@/types/patient";
// import type { Appointment } from "@/types/appointment";
// TODO: definir type Procedure
interface Procedure {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
}
interface Appointment {
  id: string;
  patient_name?: string;
  date?: string;
}
interface Procedure {
  id: string;
  nome?: string;
  codigo?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "patient" | "appointment" | "procedure" | "transaction" | "product";
  route: string;
  icon: React.ElementType;
}

export type { Patient, Appointment, Procedure };
