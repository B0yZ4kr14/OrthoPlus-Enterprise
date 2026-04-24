// cspell:disable

export interface ProblemaPattern {
  tipo: string;
  ocorrencias: number;
}

export interface AreaProblematica {
  area: string;
  ocorrencias: number;
}

export interface SeveridadeCount {
  severidade: string;
  quantidade: number;
}

export interface TipoAnaliseCount {
  tipo: string;
  quantidade: number;
}

export interface RecomendacaoPreventiva {
  titulo: string;
  descricao: string;
  prioridade: "alta" | "media" | "baixa";
}
