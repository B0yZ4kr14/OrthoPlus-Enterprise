import { useCallback } from "react";

export function useCurrencyFormatter() {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }, []);

  return { formatCurrency };
}
