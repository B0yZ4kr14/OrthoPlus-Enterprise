import { useState, useCallback } from "react";
import type {
  AberturaCaixaDialogProps,
  UseAberturaCaixaReturn,
} from "../types";

export function useAberturaCaixa(
  onConfirm: AberturaCaixaDialogProps["onConfirm"],
  onOpenChange: AberturaCaixaDialogProps["onOpenChange"],
): UseAberturaCaixaReturn {
  const [valorInicial, setValorInicial] = useState("0");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      await onConfirm(parseFloat(valorInicial) || 0, observacoes);
      setValorInicial("0");
      setObservacoes("");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [onConfirm, onOpenChange, valorInicial, observacoes]);

  return {
    valorInicial,
    setValorInicial,
    observacoes,
    setObservacoes,
    loading,
    handleSubmit,
  };
}
