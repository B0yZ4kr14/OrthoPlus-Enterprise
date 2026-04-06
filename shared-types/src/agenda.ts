/**
 * Agenda (Appointments) Module Types
 */

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  dentist_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  treatment_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentWithPatient extends Appointment {
  patient?: {
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  };
  dentist?: {
    id: string;
    nome: string;
    especialidade?: string;
  };
}

export interface CreateAppointmentRequest {
  patient_id: string;
  dentist_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  treatment_id?: string;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  id: string;
  status?: AppointmentStatus;
}

export interface AppointmentFilters {
  patient_id?: string;
  dentist_id?: string;
  status?: AppointmentStatus;
  start_date?: string;
  end_date?: string;
  clinic_id?: string;
}
