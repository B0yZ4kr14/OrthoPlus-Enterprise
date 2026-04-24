import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type { PSBTFormData, PSBTResponse } from "./types";

export function usePSBTBuilder() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [psbtBase64, setPsbtBase64] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePSBT = useCallback(async () => {
    if (!recipient || !amount) {
      toast.error("Preencha destinatário e valor");
      return;
    }

    try {
      const response = await fetch("/api/crypto/create-psbt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          amount: parseFloat(amount),
        }),
      });

      const data = (await response.json()) as PSBTResponse;
      setPsbtBase64(data.psbt);
      toast.success("PSBT gerado com sucesso!");
    } catch (error) {
      logger.error("Erro ao gerar PSBT:", error);
      toast.error("Erro ao gerar transação");
    }
  }, [recipient, amount]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(psbtBase64);
    setCopied(true);
    toast.success("PSBT copiado!");
    setTimeout(() => setCopied(false), 2000);
  }, [psbtBase64]);

  return {
    recipient,
    amount,
    psbtBase64,
    copied,
    setRecipient,
    setAmount,
    generatePSBT,
    copyToClipboard,
  };
}
