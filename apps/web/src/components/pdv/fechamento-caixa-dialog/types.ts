export interface FechamentoCaixaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaAberto: boolean;
  valorEsperado: number;
  onConfirm: (data: FechamentoData) => void;
}

export interface FechamentoData {
  valorFinal: number;
  observacoes: string;
  diferenca: number;
}

export type DiferencaType = "surplus" | "shortage" | "exact";

export interface DiferencaInfo {
  type: DiferencaType;
  amount: number;
  message: string;
  variant: "default" | "destructive" | "warning";
}
