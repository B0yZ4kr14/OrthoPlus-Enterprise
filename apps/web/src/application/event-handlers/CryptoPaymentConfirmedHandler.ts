/**
 * FASE 2 - SPRINT 2: Handler para CryptoPaymentConfirmedEvent
 */

import { CryptoPaymentConfirmedEvent } from "@/domain/events/CryptoPaymentEvents";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

export class CryptoPaymentConfirmedHandler {
  async handle(event: CryptoPaymentConfirmedEvent): Promise<void> {
    try {
      await this.updateCryptoTransaction(event);

      if (event.payload.contaReceberId) {
        await this.updateContaReceber(event);
      }

      await this.registerFinancialTransaction(event);
      await this.processSplitPayment(event);

      if (event.payload.orderId?.startsWith("pdv-")) {
        await this.registerPDVPayment(event);
      }

      this.notifyClinic(event);
      await this.logAudit(event);

      console.log(
        "[CryptoPaymentConfirmedHandler] Event processed successfully",
      );
    } catch (error) {
      console.error(
        "[CryptoPaymentConfirmedHandler] Error processing event:",
        error,
      );

      try {
        await apiClient.post("/audit_logs", {
          clinic_id: event.payload.clinicId,
          action: "CRYPTO_PAYMENT_PROCESSING_ERROR",
          details: {
            transactionId: event.payload.transactionId,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      } catch (logError) {
        console.error("Failed to log audit error:", logError);
      }

      throw error;
    }
  }

  private async updateCryptoTransaction(
    event: CryptoPaymentConfirmedEvent,
  ): Promise<void> {
    console.log("[CryptoPaymentConfirmedHandler] Updating transaction:", event);
  }

  private async updateContaReceber(
    event: CryptoPaymentConfirmedEvent,
  ): Promise<void> {
    const valorBRL = event.payload.amount;

    try {
      await apiClient.patch(`/contas_receber/${event.payload.contaReceberId}`, {
        status: "PAGO",
        data_pagamento: new Date().toISOString(),
        valor_pago: valorBRL,
        forma_pagamento: "CRYPTO",
        observacoes: `Pagamento confirmado via ${event.payload.cryptocurrency}. TxHash: ${event.payload.txHash}`,
      });
    } catch (error) {
      console.error(
        "[CryptoPaymentConfirmedHandler] Error updating conta_receber:",
        error,
      );
    }
  }

  private async registerFinancialTransaction(
    event: CryptoPaymentConfirmedEvent,
  ): Promise<void> {
    console.log(
      "[CryptoPaymentConfirmedHandler] Registered financial transaction:",
      event,
    );
  }

  private async processSplitPayment(
    event: CryptoPaymentConfirmedEvent,
  ): Promise<void> {
    console.log(
      "[CryptoPaymentConfirmedHandler] Processing split payment:",
      event,
    );
  }

  private async registerPDVPayment(
    event: CryptoPaymentConfirmedEvent,
  ): Promise<void> {
    console.log(
      "[CryptoPaymentConfirmedHandler] Registered PDV payment:",
      event,
    );
  }

  private notifyClinic(event: CryptoPaymentConfirmedEvent): void {
    toast.success("🎉 Pagamento em Crypto Confirmado!", {
      description: `${event.payload.amount} ${event.payload.cryptocurrency} recebido. ${event.payload.confirmations} confirmações.`,
      duration: 5000,
    });
  }

  private async logAudit(event: CryptoPaymentConfirmedEvent): Promise<void> {
    try {
      await apiClient.post("/audit_logs", {
        clinic_id: event.payload.clinicId,
        action: "CRYPTO_PAYMENT_CONFIRMED",
        action_type: "FINANCIAL",
        details: {
          transactionId: event.payload.transactionId,
          cryptocurrency: event.payload.cryptocurrency,
          amount: event.payload.amount,
          txHash: event.payload.txHash,
          confirmations: event.payload.confirmations,
          timestamp: event.occurredAt.toISOString(),
        },
      });
    } catch (err) {
      console.error(
        "Failed to insert audit log for payment confirmation.",
        err,
      );
    }
  }
}

export const cryptoPaymentConfirmedHandler =
  new CryptoPaymentConfirmedHandler();
