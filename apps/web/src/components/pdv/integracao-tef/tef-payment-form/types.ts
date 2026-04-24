import type { TEFOperationType } from "../types";

export type { TEFOperationType };

export interface TEFPaymentFormProps {
  valorTotal: number;
  tipoOperacao: TEFOperationType;
  onTipoChange: (value: TEFOperationType) => void;
  numParcelas: number;
  onParcelasChange: (value: number) => void;
  processando: boolean;
  onProcessar: () => void;
}

export interface ParcelaOption {
  value: string;
  label: string;
}
