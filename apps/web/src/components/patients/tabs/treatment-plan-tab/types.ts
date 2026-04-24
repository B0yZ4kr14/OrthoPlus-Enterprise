export interface Treatment {
  id: string;
  titulo: string;
  dente_codigo?: string;
  status: string;
  data_inicio?: string;
  data_conclusao?: string;
  valor_estimado?: number;
  descricao?: string;
  observacoes?: string;
}

export interface TreatmentPlanTabProps {
  patientId: string;
}

export interface StatusConfig {
  label: string;
  iconColor: string;
}
