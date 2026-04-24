import type { AtividadeTipo } from "@/modules/crm/domain/entities/Atividade";

export interface AtividadeFormData {
  tipo: AtividadeTipo;
  titulo: string;
  descricao?: string;
  dataAgendada?: string;
}

export interface AtividadeFormProps {
  onSubmit: (data: AtividadeFormData) => void;
  onCancel: () => void;
}

export const TIPO_LABELS: Record<AtividadeTipo, string> = {
  LIGACAO: "Ligação",
  EMAIL: "E-mail",
  REUNIAO: "Reunião",
  WHATSAPP: "WhatsApp",
  VISITA: "Visita",
  OUTRO: "Outro",
};
