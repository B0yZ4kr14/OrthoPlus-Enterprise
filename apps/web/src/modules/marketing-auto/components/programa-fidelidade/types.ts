// cspell:disable

export type NivelFidelidade = "DIAMANTE" | "PLATINA" | "OURO" | "PRATA" | "BRONZE";
export type StatusIndicacao = "COMPARECEU" | "AGENDADO" | "PENDENTE" | "NAO_COMPARECEU";

export interface Badge {
  nome: string;
}

export interface PacientePontos {
  id: string;
  patient_name: string;
  nivel: NivelFidelidade;
  pontos_totais: number;
  pontos_disponiveis: number;
  badges?: Badge[];
}

export interface Recompensa {
  id: string;
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  ativo: boolean;
}

export interface Indicacao {
  id?: string;
  indicador_nome?: string;
  indicador?: { nome: string };
  indicado_nome: string;
  indicado_telefone: string;
  status: StatusIndicacao;
  created_at?: string;
  pontos_concedidos?: number;
}
