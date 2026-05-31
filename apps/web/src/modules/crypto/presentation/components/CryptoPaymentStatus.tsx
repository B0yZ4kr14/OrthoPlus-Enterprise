import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

import { CryptoInvoice } from "../../types/crypto.types";

interface CryptoPaymentStatusProps {
  paymentId: string;
  onStatusChange?: (status: CryptoInvoice["status"]) => void;
}

interface PaymentStatus {
  status: string;
  confirmations: number;
  requiredConfirmations: number;
  transactionId?: string;
  confirmedAt?: string;
}

export function CryptoPaymentStatus({
  paymentId,
  onStatusChange,
}: CryptoPaymentStatusProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/exhaustive-deps -- data-fetching functions capture deps from closure */
  useEffect(() => {
    fetchPaymentStatus();

    // Poll for status updates every 10s
    const interval = setInterval(fetchPaymentStatus, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [paymentId, onStatusChange]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchPaymentStatus = async () => {
    try {
      const data = await apiClient.get<{
        status: string;
        confirmations: number;
        transaction_id?: string;
        confirmed_at?: string;
      }>(`/crypto/payments/${paymentId}`);

      if (!data) return;

      const newStatus: PaymentStatus = {
        status: data.status,
        confirmations: data.confirmations || 0,
        requiredConfirmations: 3,
        transactionId: data.transaction_id,
        confirmedAt: data.confirmed_at,
      };

      setPaymentStatus(newStatus);
      onStatusChange?.(data.status as CryptoInvoice["status"]);

      if (data.status === "CONFIRMED") {
        toast.success("Pagamento confirmado!", {
          description:
            "Seu pagamento em criptomoeda foi confirmado com sucesso.",
        });
      }
    } catch (error) {
      toast.error("Erro ao carregar status");
      toast.error("Erro ao buscar status do pagamento");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Pagamento não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case "PENDING":
        return <Clock className="h-8 w-8 text-warning" />;
      case "PROCESSING":
        return <Loader2 className="h-8 w-8 animate-spin text-info" />;
      case "CONFIRMED":
        return <CheckCircle2 className="h-8 w-8 text-success" />;
      case "EXPIRED":
      case "FAILED":
        return <AlertCircle className="h-8 w-8 text-destructive" />;
      default:
        return <Clock className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus.status) {
      case "PENDING":
        return "Aguardando Pagamento";
      case "PROCESSING":
        return "Processando Pagamento";
      case "CONFIRMED":
        return "Pagamento Confirmado";
      case "EXPIRED":
        return "Pagamento Expirado";
      case "FAILED":
        return "Pagamento Falhou";
      default:
        return "Status Desconhecido";
    }
  };

  const confirmationProgress =
    (paymentStatus.confirmations / paymentStatus.requiredConfirmations) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Pagamento</CardTitle>
        <CardDescription>
          Acompanhe o progresso do seu pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Icon & Text */}
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          <div className="text-center">
            <p className="text-xl font-semibold">{getStatusText()}</p>
            {paymentStatus.status === "PROCESSING" && (
              <p className="text-sm text-muted-foreground mt-1">
                Aguardando confirmações da blockchain
              </p>
            )}
          </div>
        </div>

        {/* Confirmations Progress */}
        {paymentStatus.status === "PROCESSING" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confirmações</span>
              <span className="font-mono">
                {paymentStatus.confirmations} /{" "}
                {paymentStatus.requiredConfirmations}
              </span>
            </div>
            <Progress value={confirmationProgress} className="h-2" />
          </div>
        )}

        {/* Transaction ID */}
        {paymentStatus.transactionId && (
          <div className="space-y-2">
            <p className="text-sm font-medium">ID da Transação</p>
            <code className="block p-3 bg-muted rounded-md text-xs break-all">
              {paymentStatus.transactionId}
            </code>
          </div>
        )}

        {/* Confirmed At */}
        {paymentStatus.confirmedAt && (
          <div className="p-4 bg-success/5 dark:bg-success/20 rounded-lg">
            <p className="text-sm text-success dark:text-success">
              ✅ Confirmado em{" "}
              {new Date(paymentStatus.confirmedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Linha do Tempo</p>
          <div className="space-y-2">
            <TimelineItem
              completed={true}
              label="Pagamento iniciado"
              time="Completo"
            />
            <TimelineItem
              completed={paymentStatus.status !== "PENDING"}
              label="Transação detectada"
              time={
                paymentStatus.status !== "PENDING"
                  ? "Completo"
                  : "Aguardando..."
              }
            />
            <TimelineItem
              completed={paymentStatus.status === "CONFIRMED"}
              label="Confirmações recebidas"
              time={
                paymentStatus.status === "CONFIRMED"
                  ? "Completo"
                  : "Aguardando..."
              }
            />
            <TimelineItem
              completed={paymentStatus.status === "CONFIRMED"}
              label="Pagamento processado"
              time={
                paymentStatus.status === "CONFIRMED"
                  ? "Completo"
                  : "Aguardando..."
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelineItemProps {
  completed: boolean;
  label: string;
  time: string;
}

function TimelineItem({ completed, label, time }: TimelineItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          completed ? "bg-success" : "bg-muted"
        }`}
      />
      <div className="flex-1 flex justify-between">
        <span className={`text-sm ${completed ? "" : "text-muted-foreground"}`}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}
