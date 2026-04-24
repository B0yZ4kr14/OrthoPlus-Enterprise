import type {
  Atividade,
  AtividadeTipo,
  AtividadeStatus,
} from "@/modules/crm/domain/entities/Atividade";

export type { Atividade, AtividadeTipo, AtividadeStatus };

export interface AtividadeListProps {
  atividades: Atividade[];
  onConcluir: (atividadeId: string, resultado?: string) => void;
}
