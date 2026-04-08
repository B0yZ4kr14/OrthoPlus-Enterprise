import React from "react";
import { CryptoComparativeDashboard } from "@/modules/crypto/components/CryptoComparativeDashboard";

interface CryptoComparativeViewProps {
  transactions: any[];
}

export function CryptoComparativeView({ transactions }: CryptoComparativeViewProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Dashboard Comparativo de Rentabilidade
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Compare taxas e economia entre criptomoedas e métodos
            tradicionais
          </p>
        </div>
      </div>

      <CryptoComparativeDashboard transactions={transactions} />
    </>
  );
}
