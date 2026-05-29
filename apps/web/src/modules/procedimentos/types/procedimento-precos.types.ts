export interface TabelaPreco {
  id: string;
  nome: string;
  tipo: "PARTICULAR" | "CONVENIO";
  convenio_id: string | null;
  is_active: boolean;
  is_default: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProcedimentoPreco {
  id: string;
  procedimento_template_id: string;
  tabela_preco_id: string;
  valor: number;
  tempo_retorno_dias: number | null;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  procedimento_template?: {
    id: string;
    nome: string;
    codigo_tuss: string | null;
  };
  tabela_preco?: TabelaPreco;
}

export interface CriarTabelaPreco {
  nome: string;
  tipo: "PARTICULAR" | "CONVENIO";
  convenio_id?: string | null;
  is_default?: boolean;
}

export interface AtualizarTabelaPreco {
  nome?: string;
  tipo?: "PARTICULAR" | "CONVENIO";
  convenio_id?: string | null;
  is_active?: boolean;
  is_default?: boolean;
}

export interface CriarProcedimentoPreco {
  procedimento_template_id: string;
  tabela_preco_id: string;
  valor: number;
  tempo_retorno_dias?: number | null;
}

export interface ReajusteLote {
  tabela_preco_id: string;
  percentual: number;
}

export interface DentistaProcedimento {
  id: string;
  dentista_id: string;
  procedimento_template_id: string;
  duracao_customizada_min: number | null;
  comissao_percentual: number;
  is_active: boolean;
  clinic_id: string;
  created_at: string;
  updated_at: string;
  procedimento_template?: {
    id: string;
    nome: string;
  };
}

export interface CriarDentistaProcedimento {
  dentista_id: string;
  procedimento_template_id: string;
  duracao_customizada_min?: number | null;
  comissao_percentual?: number;
  is_active?: boolean;
}
