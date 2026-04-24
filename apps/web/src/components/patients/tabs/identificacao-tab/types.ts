export interface IdentificacaoTabProps {
  patient: Record<string, any>;
}

export interface PatientDataSection {
  title: string;
  icon: string;
  fields: PatientField[];
}

export interface PatientField {
  key: string;
  label: string;
  format?: "date" | "age" | "capitalize" | "default";
  fallback?: string;
  mono?: boolean;
}

export interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}

export interface PatientCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
