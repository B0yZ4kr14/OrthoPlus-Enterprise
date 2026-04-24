import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";

export type PaymentMethod = "PIX" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "CRYPTO";

export interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  conta: ContaReceber;
  onSuccess: () => void;
}

export interface PaymentFormData {
  valor: string;
  metodo: PaymentMethod;
  pixKey: string;
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
}

export interface CardFields {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}
