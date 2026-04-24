import type { UseFormReturn } from "react-hook-form";
import type { PatientFormValues } from "@/lib/patient-validation";

export interface OtherTabProps {
  form: UseFormReturn<PatientFormValues>;
}

export interface PaymentMethodOption {
  value: string;
  label: string;
}

export interface StatusOption {
  value: string;
  label: string;
}

export interface ConsentField {
  name: keyof PatientFormValues;
  label: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "pix", label: "PIX" },
  { value: "boleto", label: "Boleto" },
];

export const PATIENT_STATUSES: StatusOption[] = [
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
  { value: "arquivado", label: "Arquivado" },
];

export const CONSENT_FIELDS: ConsentField[] = [
  {
    name: "lgpd_consent",
    label: "Consentimento LGPD",
    description:
      "Autoriza o uso e armazenamento de dados pessoais conforme a Lei Geral de Proteção de Dados",
  },
  {
    name: "treatment_consent",
    label: "Consentimento de Tratamento",
    description:
      "Autoriza a realização de procedimentos odontológicos e tratamentos propostos",
  },
  {
    name: "image_usage_consent",
    label: "Uso de Imagens",
    description:
      "Autoriza o uso de imagens (fotos, radiografias) para fins clínicos e acadêmicos",
  },
  {
    name: "data_sharing_consent",
    label: "Compartilhamento de Dados",
    description:
      "Autoriza o compartilhamento de dados com laboratórios e outros profissionais de saúde quando necessário",
  },
];
