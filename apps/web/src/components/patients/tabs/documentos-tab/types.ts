export interface DocumentosTabProps {
  patient: Record<string, any>;
}

export interface ConsentItem {
  key: string;
  title: string;
  description: string;
  consentKey: string;
  dateKey?: string;
}

export interface ConsentCardProps {
  title: string;
  description: string;
  consented: boolean;
  date?: string;
}
