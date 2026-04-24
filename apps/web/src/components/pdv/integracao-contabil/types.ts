/**
 * Tipos para Integração Contábil
 */

export interface ContabilConfig {
  id: string;
  software: string;
  api_url: string;
  api_key?: string;
  api_secret?: string;
  codigo_empresa?: string;
  envio_automatico: boolean;
  enviar_sped_fiscal: boolean;
  enviar_nfce_dados: boolean;
  periodicidade_envio: string;
  email_contador?: string;
  ativo: boolean;
  created_at: string;
}

export interface ContabilEnvio {
  id: string;
  integracao_contabil_config?: {
    software: string;
  };
  status: "SUCESSO" | "ERRO" | "PENDENTE";
  tipo_documento: string;
  periodo_referencia: string;
  enviado_em?: string;
  erro_mensagem?: string;
  created_at: string;
}

export interface ConfigFormData {
  software: string;
  api_url: string;
  api_key: string;
  api_secret: string;
  codigo_empresa: string;
  envio_automatico: boolean;
  enviar_sped_fiscal: boolean;
  enviar_nfce_dados: boolean;
  periodicidade_envio: string;
  email_contador: string;
  ativo: boolean;
}

export const DEFAULT_FORM_DATA: ConfigFormData = {
  software: "TOTVS",
  api_url: "",
  api_key: "",
  api_secret: "",
  codigo_empresa: "",
  envio_automatico: true,
  enviar_sped_fiscal: true,
  enviar_nfce_dados: true,
  periodicidade_envio: "DIARIO",
  email_contador: "",
  ativo: true,
};
