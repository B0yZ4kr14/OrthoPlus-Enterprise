// cspell:disable
export interface KpiData {
  totalInventarios: number;
  totalDivergencias: number;
  totalPerdas: number;
  acuracidadeMedia: number;
  variacaoPerdas: number;
  totalItensAnalisados: number;
}

export interface TendenciaAcuracidade {
  mes: string;
  acuracidade: number;
  divergencias: number;
}

export interface PerdasMensais {
  mes: string;
  perdas: number;
}

export interface ProdutoPerda {
  nome: string;
  perda: number;
  quantidade: number;
}

export interface CriticidadeItem {
  name: string;
  value: number;
  color: string;
}

export const CRITICIDADE_COLORS = {
  baixa: "#10b981",
  media: "#f59e0b",
  alta: "#ef4444",
  critica: "#7c3aed",
};
