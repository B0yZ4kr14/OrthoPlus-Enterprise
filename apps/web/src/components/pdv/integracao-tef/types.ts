export interface TEFTransaction {
  success: boolean;
  transacao: {
    nsu_sitef: string;
    codigo_autorizacao: string;
    tipo_operacao: string;
    valor: string;
    comprovante_cliente: string;
  };
  error?: string;
}

export interface IntegracaoTEFProps {
  vendaId: string;
  valorTotal: number;
  onSuccess?: () => void;
}

export type TEFOperationType = "DEBITO" | "CREDITO" | "VOUCHER" | "PIX_TEF";

export const OPERATION_OPTIONS: Array<{ value: TEFOperationType; label: string }> = [
  { value: "DEBITO", label: "Débito" },
  { value: "CREDITO", label: "Crédito" },
  { value: "VOUCHER", label: "Voucher" },
  { value: "PIX_TEF", label: "PIX (TEF)" },
];
