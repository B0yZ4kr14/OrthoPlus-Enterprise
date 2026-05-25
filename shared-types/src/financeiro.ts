/**
 * Financeiro Module Types
 * Shared between backend and frontend
 */

// ============================================================================
// Transaction
// ============================================================================

export type TransactionType = "RECEITA" | "DESPESA";
export type TransactionStatus = "PENDENTE" | "PAGO" | "CANCELADO" | "ATRASADO";
export type PaymentMethod =
  | "DINHEIRO"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "PIX"
  | "BOLETO"
  | "TRANSFERENCIA"
  | "CHEQUE";

export interface Transaction {
  id: string;
  clinicId: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  category?: string;
  dueDate?: string;
  paidAt?: string;
  patientId?: string;
  appointmentId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  clinicId: string;
  type: TransactionType;
  description: string;
  amount: number;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  category?: string;
  dueDate?: string;
  patientId?: string;
  appointmentId?: string;
  notes?: string;
  createdBy?: string;
}

// ============================================================================
// Cash Flow
// ============================================================================

export interface CashFlowData {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  periodStart: string;
  periodEnd: string;
  transactions: Transaction[];
}

// ============================================================================
// Accounts Receivable / Payable
// ============================================================================

export interface ContaReceber {
  id: string;
  clinicId: string;
  patientId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}

export interface ContaPagar {
  id: string;
  clinicId: string;
  supplierId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  createdAt: string;
}
