import type { ConsentItem } from "../types";

export const LGPD_CONSENTS: ConsentItem[] = [
  {
    key: "lgpd",
    title: "Consentimento LGPD",
    description: "Uso e tratamento de dados pessoais",
    consentKey: "lgpd_consent",
    dateKey: "lgpd_consent_date",
  },
  {
    key: "image_usage",
    title: "Uso de Imagem",
    description: "Consentimento para fotos e vídeos",
    consentKey: "image_usage_consent",
  },
  {
    key: "treatment",
    title: "Termo de Tratamento",
    description: "Consentimento para procedimentos",
    consentKey: "treatment_consent",
  },
  {
    key: "data_sharing",
    title: "Compartilhamento de Dados",
    description: "Autorização para compartilhamento",
    consentKey: "data_sharing_consent",
  },
];
