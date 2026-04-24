import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FinancialTabProps, Budget, FinancialSummary, PaymentStatus } from "./types";

async function fetchPatientData(patientId: string) {
  // Mock data - replace with actual API call
  return {
    id: patientId,
    paymentStatus: "paid" as PaymentStatus,
    totalPaid: 1250.0,
    totalPending: 0,
  };
}

async function fetchBudgets(patientId: string): Promise<Budget[]> {
  // Mock data - replace with actual API call
  return [
    {
      id: "1",
      number: "ORC-2025-001",
      date: "15/01/2025",
      total: 1250.0,
      discount: 50.0,
      status: "approved",
    },
    {
      id: "2",
      number: "ORC-2025-002",
      date: "20/01/2025",
      total: 2300.0,
      discount: 100.0,
      status: "pending",
    },
  ];
}

function calculateSummary(budgets: Budget[]): FinancialSummary {
  return budgets.reduce(
    (acc, budget) => ({
      totalBudgets: acc.totalBudgets + 1,
      approvedBudgets: acc.approvedBudgets + (budget.status === "approved" ? 1 : 0),
      totalValue: acc.totalValue + budget.total,
      paidValue: acc.paidValue + (budget.status === "completed" ? budget.total - budget.discount : 0),
      balance: 0, // Calculate based on payments
    }),
    { totalBudgets: 0, approvedBudgets: 0, totalValue: 0, paidValue: 0, balance: 0 }
  );
}

export function useFinancialTab(patientId: FinancialTabProps["patientId"]) {
  const { data: patient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => fetchPatientData(patientId),
  });

  const { data: budgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ["patient-budgets", patientId],
    queryFn: () => fetchBudgets(patientId),
  });

  const summary = useMemo(() => calculateSummary(budgets), [budgets]);

  const isLoading = isPatientLoading || isBudgetsLoading;

  return {
    patient,
    budgets,
    summary,
    isLoading,
  };
}
