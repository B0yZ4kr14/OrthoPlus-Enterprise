// cspell:disable

export type Periodo = "7d" | "30d" | "90d";

export interface VendaItem {
  descricao?: string;
  quantidade: number;
  valor_total: number;
}

export interface Pagamento {
  forma_pagamento: string;
  valor: number;
}

export interface Venda {
  id?: string;
  created_by: string;
  created_at: string;
  valor_total: number;
  pdv_venda_itens?: VendaItem[];
  pdv_pagamentos?: Pagamento[];
}

export interface Stats {
  totalVendas: number;
  valorTotal: number;
  ticketMedio: number;
  itensVendidos: number;
}

export interface VendedorData {
  vendedor: string;
  total: number;
  quantidade: number;
}

export interface ProdutoData {
  produto: string;
  quantidade: number;
  valor: number;
}

export interface HorarioData {
  hora: string;
  vendas: number;
  valor: number;
}

export interface PagamentoData {
  name: string;
  value: number;
}

export interface TempoData {
  data: string;
  vendas: number;
  valor: number;
}

export const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--info))",
  "hsl(var(--muted))",
];
