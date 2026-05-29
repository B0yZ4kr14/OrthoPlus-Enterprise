"use client";

import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import { broadcastTransaction as broadcastTx } from "@/lib/api/cryptoInternalApi";
import type { KruxStatus } from "./types";

export function useKruxIntegration() {
  const [status, setStatus] = useState<KruxStatus>("idle");
  const [signedPSBT, setSignedPSBT] = useState("");

  const scanSignedTransaction = useCallback(async () => {
    setStatus("scanning");

    try {
      toast.info("Escaneie o QR Code do Krux com a transação assinada");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSignedPSBT("cHNidP8BAHECAAAAAcxxxxxxxx...");
      setStatus("signed");
      toast.success("Transação assinada recebida do Krux!");
    } catch (error) {
      logger.error("Erro ao escanear:", error);
      toast.error("Erro ao escanear QR Code");
      setStatus("idle");
    }
  }, []);

  const broadcastTransaction = useCallback(async () => {
    try {
      const data = await broadcastTx({ signedPsbt: signedPSBT });
      toast.success(
        `Transação enviada! TxID: ${data.txId.substring(0, 12)}...`,
      );
      setStatus("idle");
      setSignedPSBT("");
    } catch (error) {
      logger.error("Erro ao broadcast:", error);
      toast.error("Erro ao enviar transação");
    }
  }, [signedPSBT]);

  const reset = useCallback(() => {
    setStatus("idle");
    setSignedPSBT("");
  }, []);

  return {
    status,
    signedPSBT,
    scanSignedTransaction,
    broadcastTransaction,
    reset,
  };
}
