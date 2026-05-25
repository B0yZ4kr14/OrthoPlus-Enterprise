/**
 * PDV (Point of Sale) Module Types
 * Shared between backend and frontend
 */

// ============================================================================
// Caixa (Cash Register)
// ============================================================================

export type CaixaStatus = "ABERTO" | "FECHADO";

export interface Caixa {
  id: string;
  clinicId: string;
  userId: string;
  status: CaixaStatus;
  openedAt: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount?: number;
  totalSales: number;
  totalReturns: number;
  discrepancy?: number;
}

export interface CaixaMovimento {
  id: string;
  caixaId: string;
  type: "ENTRADA" | "SAIDA" | "SANGRIA" | "REFORCO";
  amount: number;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

export interface OpenCaixaRequest {
  clinicId: string;
  userId: string;
  initialAmount: number;
}

export interface CloseCaixaRequest {
  caixaId: string;
  finalAmount: number;
}

// ============================================================================
// Sale
// ============================================================================

export type SaleStatus = "PENDENTE" | "CONCLUIDA" | "CANCELADA";

export interface PdvVendaItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}

export interface PdvPayment {
  method: string;
  amount: number;
  change?: number;
}

export interface PdvVenda {
  id: string;
  clinicId: string;
  caixaId?: string;
  patientId?: string;
  items: PdvVendaItem[];
  payments: PdvPayment[];
  subtotal: number;
  discount?: number;
  total: number;
  status: SaleStatus;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreatePdvVendaRequest {
  clinicId: string;
  caixaId?: string;
  patientId?: string;
  items: Omit<PdvVendaItem, "id">[];
  payments: PdvPayment[];
  discount?: number;
  notes?: string;
  createdBy?: string;
}
