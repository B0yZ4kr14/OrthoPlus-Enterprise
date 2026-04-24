// cspell:disable
export interface RelatorioFechamentoCaixaProps {
  caixaMovimentoId: string;
}

export interface FechamentoData {
  totalVendasPDV: number;
  totalNFCe: number;
  divergencia: number;
  percentualDivergencia: number;
  quantidadeVendasPDV: number;
  quantidadeNFCe: number;
  vendasSemNFCe: number;
  vendas: unknown[];
  nfces: unknown[];
}

export interface ChartDataItem {
  name: string;
  valor: number;
  quantidade: number;
}
