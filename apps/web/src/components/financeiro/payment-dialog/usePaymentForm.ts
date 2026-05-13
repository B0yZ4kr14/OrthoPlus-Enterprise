import { useState, useCallback } from "react";
import type { ContaReceber } from "@/modules/financeiro/types/financeiro-completo.types";
import type { PaymentMethod, CardFields } from "./types";

export function usePaymentForm(conta: ContaReceber) {
  const remainingValue = conta.valor - (conta.valor_pago || 0);

  const [metodo, setMetodo] = useState<PaymentMethod>("PIX");
  const [valor, setValor] = useState(remainingValue.toString());
  const [pixKey, setPixKey] = useState("");
  const [cardFields, setCardFields] = useState<CardFields>({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });

  const updateCardField = useCallback(
    (field: keyof CardFields, value: string) => {
      setCardFields((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setMetodo("PIX");
    setValor(remainingValue.toString());
    setPixKey("");
    setCardFields({ number: "", holder: "", expiry: "", cvv: "" });
  }, [remainingValue]);

  const getPaymentData = useCallback(() => {
    const valorNumerico = parseFloat(valor);

    return {
      valorNumerico,
      dadosPagamento:
        (metodo === "PIX"
          ? { pix_key: pixKey }
          : {
              card_number: cardFields.number,
              card_holder: cardFields.holder,
              card_expiry: cardFields.expiry,
              card_cvv: cardFields.cvv,
            }) as Record<string, string>,
    };
  }, [metodo, valor, pixKey, cardFields]);

  return {
    metodo,
    setMetodo,
    valor,
    setValor,
    pixKey,
    setPixKey,
    cardFields,
    updateCardField,
    resetForm,
    getPaymentData,
    remainingValue,
  };
}
