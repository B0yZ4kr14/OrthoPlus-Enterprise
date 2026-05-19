import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { createPSBT } from "@/lib/api/cryptoInternalApi";
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
      const data = await createPSBT({
        recipient,
        amount: parseFloat(amount),
      });
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
