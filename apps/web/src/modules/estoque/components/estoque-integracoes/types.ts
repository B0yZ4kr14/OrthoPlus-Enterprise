// cspell:disable
export interface FornecedorIntegracao {
  id: string;
  nome: string;
  api_enabled: boolean;
  auto_order_enabled: boolean;
  api_endpoint?: string;
  api_auth_type?: string;
}

export interface PedidoAutomatico {
  id: string;
  numero_pedido: string;
  status: "enviado" | "confirmado" | "cancelado" | string;
  created_at: string;
  valor_total: number;
  estoque_fornecedores: {
    id: string;
    nome: string;
  };
}

export interface Metrics {
  totalPedidos: number;
  pedidosEnviados: number;
  pedidosConfirmados: number;
  pedidosFalhos: number;
  taxaSucesso: number;
  tempoMedioResposta: number;
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

export interface HistoricoData {
  data: string;
  enviados: number;
  falhos: number;
}
