// cspell:disable
export interface AnaliseStats {
  totalPedidos: number;
  pedidosAutomaticos: number;
  valorTotal: number;
  tempoMedioEntrega: number;
  economiaAutomacao: number;
}

export interface FornecedorHistorico {
  nome: string;
  total: number;
  quantidade: number;
}

export interface ProdutoMaisPedido {
  nome: string;
  quantidade: number;
  valor: number;
}

export interface EvolucaoPedido {
  mes: string;
  manual: number;
  automatico: number;
  total: number;
}

export interface StatusDistribuicao {
  name: string;
  value: number;
}

export const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  RECEBIDO: "Recebido",
  CANCELADO: "Cancelado",
};
