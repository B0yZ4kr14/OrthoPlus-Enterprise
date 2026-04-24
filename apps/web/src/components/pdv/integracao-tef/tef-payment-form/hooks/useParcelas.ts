import { useMemo } from "react";
import type { ParcelaOption } from "../types";

export function useParcelas(valorTotal: number): ParcelaOption[] {
  return useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
      value: n.toString(),
      label: `${n}x de R$ ${(valorTotal / n).toFixed(2)}`,
    }));
  }, [valorTotal]);
}
