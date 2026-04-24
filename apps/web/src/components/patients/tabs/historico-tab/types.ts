export interface HistoricoTabProps {
  patient: Record<string, any>;
}

export interface SummaryCardProps {
  firstAppointmentDate?: string;
  lastAppointmentDate?: string;
  totalAppointments?: number;
}

export interface TimelinePlaceholderProps {
  title?: string;
  description?: string;
}

export interface RegistrationInfoProps {
  createdAt: string;
  updatedAt: string;
  status: string;
}
