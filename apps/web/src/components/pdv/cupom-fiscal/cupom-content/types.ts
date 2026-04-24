import type { CupomFiscalProps } from "../types";

export interface CupomContentProps {
  items: CupomFiscalProps["items"];
  valorTotal: number;
}

export interface CupomItem {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
}

export interface CupomHeaderProps {
  clinicName?: string;
  systemName?: string;
  cnpj?: string;
  address?: string;
}

export interface CupomItemsTableProps {
  items: CupomFiscalProps["items"];
}

export interface CupomTotalProps {
  valorTotal: number;
}
