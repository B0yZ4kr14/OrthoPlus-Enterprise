import type { Contrato } from "@/modules/contratos/types/contrato.types";

export interface ContratoFormProps {
  onSubmit: (data: Omit<Contrato, "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
  initialData?: Partial<Contrato>;
}

export type ContratoStatus =
  | "AGUARDANDO_ASSINATURA"
  | "ASSINADO"
  | "CANCELADO"
  | "EXPIRADO"
  | "CONCLUIDO";

export interface StatusOption {
  value: ContratoStatus;
  label: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { value: "AGUARDANDO_ASSINATURA", label: "Aguardando Assinatura" },
  { value: "ASSINADO", label: "Assinado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "EXPIRADO", label: "Expirado" },
  { value: "CONCLUIDO", label: "Concluído" },
];
