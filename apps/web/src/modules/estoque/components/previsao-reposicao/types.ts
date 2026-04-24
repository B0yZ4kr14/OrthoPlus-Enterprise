// cspell:disable

export type StatusPrevisao = "CRITICO" | "ALERTA" | "NORMAL" | "EXCESSO";
export type Tendencia = "CRESCENTE" | "ESTAVEL" | "DECRESCENTE";
export type Sazonalidade = "ALTA" | "MEDIA" | "BAIXA";
export type TipoEvento = "PROMOCAO" | "FERIAS" | "EXPANSAO" | "OUTRO";

export interface MetodoTradicional {
  diasAteEstoqueZero: number;
  quantidadeSugerida: number;
}

export interface Previsao {
  produto: string;
  status: StatusPrevisao;
  diasAteEstoqueMinimo: number;
  diasAteEstoqueZero: number;
  dataEstimadaReposicao: string;
  quantidadeSugerida: number;
  tendencia: Tendencia;
  sazonalidade: Sazonalidade;
  confianca: number;
  justificativa: string;
  recomendacao: string;
  metodoTradicional?: MetodoTradicional;
}

export interface EventoFuturo {
  tipo: TipoEvento;
  dataInicio: string;
  dataFim: string;
  impactoEstimado: number;
  descricao: string;
}

export interface ResumoPrevisao {
  totalProdutos: number;
  criticos: number;
  alertas: number;
  normais: number;
}
