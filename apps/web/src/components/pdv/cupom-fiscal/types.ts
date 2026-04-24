// cspell:disable
export interface CupomFiscalProps {
  venda: Record<string, any>;
  items: unknown[];
}

export interface CupomItem {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}
