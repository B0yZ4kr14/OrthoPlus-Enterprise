// cspell:disable
export interface ImpressoraConfig {
  id: string;
  tipo_equipamento: string;
  numero_serie: string;
  codigo_ativacao: string;
  ip_address?: string;
  porta?: number;
  modelo?: string;
  fabricante?: string;
  versao_software?: string;
  ativo: boolean;
  clinic_id: string;
}

export interface FormData {
  tipo_equipamento: string;
  numero_serie: string;
  codigo_ativacao: string;
  ip_address: string;
  porta: number;
  modelo: string;
  fabricante: string;
  versao_software: string;
  ativo: boolean;
}
