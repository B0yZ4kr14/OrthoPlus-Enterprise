export interface FinancialTabProps {
  patientId: string;
}

export interface Budget {
  id: string;
  number: string;
  date: string;
  total: number;
  discount: number;
  status: "pending" | "approved" | "rejected" | "completed";
}

export interface FinancialSummary {
  totalBudgets: number;
  approvedBudgets: number;
  totalValue: number;
  paidValue: number;
  balance: number;
}

export type BudgetStatus = Budget["status"];
export type PaymentStatus = "paid" | "pending" | "overdue";

export type PaymentStatusConfig = any;
export type BudgetStatusConfig = any;
