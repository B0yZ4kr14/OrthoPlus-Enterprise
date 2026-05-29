// cspell:disable
import { useMemo } from "react";
import type {
  CryptoTransaction,
  CryptoStats,
  ComparisonMethod,
  SavingsData,
  PieDataItem,
} from "./types";
import { TRADITIONAL_FEES } from "./types";

interface UseCryptoComparativeProps {
  transactions: CryptoTransaction[];
}

export function useCryptoComparative({
  transactions,
}: UseCryptoComparativeProps) {
  const cryptoStats: CryptoStats = useMemo(() => {
    return transactions
      .filter((t) => t.status === "CONFIRMADO" || t.status === "CONVERTIDO")
      .reduce(
        (acc, t) => {
          acc.totalBRL += t.amount_brl || 0;
          acc.totalFees += t.processing_fee_brl || 0;
          acc.netAmount += t.net_amount_brl || 0;
          acc.count += 1;
          return acc;
        },
        { totalBRL: 0, totalFees: 0, netAmount: 0, count: 0 },
      );
  }, [transactions]);

  const cryptoFeePercentage = useMemo(() => {
    return cryptoStats.totalBRL > 0
      ? (cryptoStats.totalFees / cryptoStats.totalBRL) * 100
      : 0;
  }, [cryptoStats]);

  const comparisonData: ComparisonMethod[] = useMemo(() => {
    return [
      {
        method: "Crypto",
        fee: cryptoStats.totalFees,
        feePercentage: cryptoFeePercentage,
        netAmount: cryptoStats.netAmount,
        color: "#f97316",
      },
      {
        method: "PIX",
        fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.PIX) / 100,
        feePercentage: TRADITIONAL_FEES.PIX,
        netAmount:
          cryptoStats.totalBRL -
          (cryptoStats.totalBRL * TRADITIONAL_FEES.PIX) / 100,
        color: "#10b981",
      },
      {
        method: "Cartão Débito",
        fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.DEBIT_CARD) / 100,
        feePercentage: TRADITIONAL_FEES.DEBIT_CARD,
        netAmount:
          cryptoStats.totalBRL -
          (cryptoStats.totalBRL * TRADITIONAL_FEES.DEBIT_CARD) / 100,
        color: "#3b82f6",
      },
      {
        method: "Cartão Crédito",
        fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.CREDIT_CARD) / 100,
        feePercentage: TRADITIONAL_FEES.CREDIT_CARD,
        netAmount:
          cryptoStats.totalBRL -
          (cryptoStats.totalBRL * TRADITIONAL_FEES.CREDIT_CARD) / 100,
        color: "#8b5cf6",
      },
      {
        method: "Boleto",
        fee: (cryptoStats.totalBRL * TRADITIONAL_FEES.BOLETO) / 100,
        feePercentage: TRADITIONAL_FEES.BOLETO,
        netAmount:
          cryptoStats.totalBRL -
          (cryptoStats.totalBRL * TRADITIONAL_FEES.BOLETO) / 100,
        color: "#ef4444",
      },
    ];
  }, [cryptoStats, cryptoFeePercentage]);

  const savingsData: SavingsData[] = useMemo(() => {
    return comparisonData.slice(1).map((method) => ({
      method: `vs ${method.method}`,
      savings: method.fee - cryptoStats.totalFees,
      savingsPercentage:
        ((method.fee - cryptoStats.totalFees) / method.fee) * 100,
    }));
  }, [comparisonData, cryptoStats.totalFees]);

  const pieData: PieDataItem[] = useMemo(() => {
    return comparisonData.map((item) => ({
      name: item.method,
      value: item.fee,
      color: item.color,
    }));
  }, [comparisonData]);

  const totalSavings = useMemo(() => {
    return savingsData.reduce((sum, item) => sum + item.savings, 0);
  }, [savingsData]);

  const avgSavingsPercentage = useMemo(() => {
    return (
      savingsData.reduce((sum, item) => sum + item.savingsPercentage, 0) /
      savingsData.length
    );
  }, [savingsData]);

  const hasTransactions = cryptoStats.count > 0;

  return {
    cryptoStats,
    cryptoFeePercentage,
    comparisonData,
    savingsData,
    pieData,
    totalSavings,
    avgSavingsPercentage,
    hasTransactions,
  };
}
