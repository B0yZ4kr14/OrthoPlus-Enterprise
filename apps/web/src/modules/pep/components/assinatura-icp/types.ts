// cspell:disable
export type TabValue = "overview" | "certificates" | "documents" | "requests" | "validation";

export interface KpiData {
  certificadosAtivos: number;
  certificadosExpirando: number;
  docsAssinadosMes: number;
  docsAssinadosVariacao: number;
  aguardandoAssinatura: number;
  aguardandoPrazoProximo: number;
  taxaConformidade: number;
}

export interface DocumentoAssinado {
  name: string;
  type: string;
  date: string;
  signers: number;
}

export interface SolicitacaoPendente {
  name: string;
  requester: string;
  date: string;
  expires: string;
}

export interface Certificado {
  type: string;
  name: string;
  serial: string;
  issuer: string;
  validUntil: string;
  status: "active" | "expiring";
}

export interface Validacao {
  doc: string;
  result: string;
  date: string;
  details: string;
}

export interface CertificadoTipo {
  tipo: string;
  quantidade: number;
  status: string;
  variant: "blue" | "green" | "purple";
}
