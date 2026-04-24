import { useState, useCallback } from "react";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

type PaymentData = {
  wallet_id: string;
  amount_crypto: number;
  patient_id?: string;
  conta_receber_id?: string;
};

export function usePaymentSubmission(
  onGeneratePayment: (data: PaymentData) => Promise<any>,
  onClose: () => void,
  onReset: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (selectedWallet: string, amount: string) => {
      if (!selectedWallet || !amount || parseFloat(amount) <= 0) {
        toast.error("Preencha todos os campos");
        return;
      }

      setIsSubmitting(true);

      try {
        await onGeneratePayment({
          wallet_id: selectedWallet,
          amount_crypto: parseFloat(amount),
        });

        toast.success(
          "Solicitação de pagamento criada! Aguardando confirmação na blockchain...",
        );
        onClose();
        onReset();
      } catch (error) {
        logger.error("Error generating payment:", error);
        toast.error("Erro ao criar solicitação de pagamento");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onGeneratePayment, onClose, onReset],
  );

  return { submit, isSubmitting };
}
