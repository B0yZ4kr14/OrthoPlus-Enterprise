// cspell:disable
export interface BancoConfig {
  id?: string;
  banco_nome: string;
  banco_codigo: string;
  agencia: string;
  conta: string;
  api_url: string;
  api_key: string;
  api_secret: string;
  certificado_path: string;
  ativo: boolean;
  ultima_sincronizacao?: string;
}

export interface Banco {
  codigo: string;
  nome: string;
}
