// cspell:disable

export interface Procedimento {
  id: string;
  nome: string;
}

export interface RecompensaFormData {
  nome: string;
  descricao: string;
  pontos_necessarios: number;
  tipo: "BRINDE" | "DESCONTO_PERCENTUAL" | "DESCONTO_VALOR" | "PROCEDIMENTO_GRATIS";
  valor_desconto?: number | null;
  procedimento_id?: string | null;
  ativo: boolean;
}

export interface RecompensaFormProps {
  editingRecompensa?: {
    id: string;
    nome: string;
    descricao?: string;
    pontos_necessarios: number;
    tipo: RecompensaFormData["tipo"];
    valor_desconto?: number | null;
    procedimento_id?: string | null;
    ativo: boolean;
  } | null;
  onSuccess?: () => void;
}

export type TipoRecompensa = RecompensaFormData["tipo"];
