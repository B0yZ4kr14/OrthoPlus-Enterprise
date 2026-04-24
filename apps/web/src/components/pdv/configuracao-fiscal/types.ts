// cspell:disable
export interface FiscalFormData {
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
  tipo_emissao: "NFCE" | "SAT" | "MFE";
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  inscricao_estadual: string;
  regime_tributario: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL";
  codigo_regime_tributario: number;
  csc_id: string;
  csc_token: string;
  serie_nfce: number;
  email_contabilidade: string;
  contingencia_enabled: boolean;
  is_active: boolean;
}

export interface FiscalConfig {
  id: string;
  is_active: boolean;
  [key: string]: unknown;
}
