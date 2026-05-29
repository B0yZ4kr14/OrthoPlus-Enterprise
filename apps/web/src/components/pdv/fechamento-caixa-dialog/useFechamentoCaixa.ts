import { useState, useMemo, useCallback } from "react";
import type {
  FechamentoCaixaDialogProps,
  FechamentoData,
  DiferencaInfo,
} from "./types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function calculateDiferenca(valorFinal: string, valorEsperado: number): number {
  return valorFinal ? parseFloat(valorFinal) - valorEsperado : 0;
}

function getDiferencaInfo(diferenca: number): DiferencaInfo {
  if (diferenca > 0) {
    return {
      type: "surplus",
      amount: diferenca,
      message: `Sobrou ${formatCurrency(diferenca)}. Por favor, informe o motivo.`,
      variant: "warning",
    };
  }
  if (diferenca < 0) {
    return {
      type: "shortage",
      amount: Math.abs(diferenca),
      message: `Faltou ${formatCurrency(Math.abs(diferenca))}. Por favor, informe o motivo.`,
      variant: "destructive",
    };
  }
  return {
    type: "exact",
    amount: 0,
    message: "Valor conferido corretamente.",
    variant: "default",
  };
}

export function useFechamentoCaixa(
  valorEsperado: number,
  onConfirm: FechamentoCaixaDialogProps["onConfirm"],
  onClose: () => void,
) {
  const [valorFinal, setValorFinal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const diferenca = useMemo(
    () => calculateDiferenca(valorFinal, valorEsperado),
    [valorFinal, valorEsperado],
  );

  const diferencaInfo = useMemo(() => getDiferencaInfo(diferenca), [diferenca]);

  const hasDiferenca = diferenca !== 0;
  const isObservacaoRequired = hasDiferenca;
  const isValid =
    valorFinal !== "" && (!isObservacaoRequired || observacoes.trim() !== "");

  const handleConfirm = useCallback(() => {
    if (!isValid) return;

    const data: FechamentoData = {
      valorFinal: parseFloat(valorFinal),
      observacoes,
      diferenca,
    };

    onConfirm(data);
    // Reset state
    setValorFinal("");
    setObservacoes("");
    onClose();
  }, [valorFinal, observacoes, diferenca, isValid, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    setValorFinal("");
    setObservacoes("");
    onClose();
  }, [onClose]);

  return {
    valorFinal,
    observacoes,
    diferenca,
    diferencaInfo,
    isObservacaoRequired,
    isValid,
    setValorFinal,
    setObservacoes,
    handleConfirm,
    handleCancel,
  };
}
