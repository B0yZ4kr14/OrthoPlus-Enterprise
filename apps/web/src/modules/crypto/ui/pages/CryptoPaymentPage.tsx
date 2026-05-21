import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Input } from "@orthoplus/core-ui/input";
import { Label } from "@orthoplus/core-ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { CryptoPaymentCheckout } from "@/modules/crypto/presentation/components/CryptoPaymentCheckout";
import { CryptoPaymentStatus } from "@/modules/crypto/presentation/components/CryptoPaymentStatus";
import { CryptoPaymentHistory } from "@/modules/crypto/presentation/components/CryptoPaymentHistory";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import { Loader2, Bitcoin, Shield, Zap } from "lucide-react";
import { CryptoInvoice } from "@/modules/crypto/types/crypto.types";
import { PageHeader } from "@/components/shared/PageHeader";

export default function CryptoPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [orderId, setOrderId] = useState("");
  const [paymentData, setPaymentData] = useState<CryptoInvoice | null>(null);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountBRL = parseFloat(amount);
    if (isNaN(amountBRL) || amountBRL <= 0) {
      toast.error("Valor inválido", {
        description: "Digite um valor maior que zero",
      });
      return;
    }

    if (!orderId.trim()) {
      toast.error("ID do Pedido obrigatório");
      return;
    }

    setLoading(true);

    try {
      const data = await apiClient.post<CryptoInvoice>("/crypto/invoices", {
        amountBRL,
        orderId: orderId.trim(),
        patientEmail: "paciente@example.com",
        metadata: {
          description: "Pagamento de tratamento odontológico",
        },
      });

      if (!data) throw new Error("Erro ao gerar invoice");

      setPaymentData(data);
      setActivePaymentId(data.paymentId);
      toast.success("Invoice criada!", {
        description: "Escaneie o QR Code para pagar",
      });
    } catch (error: unknown) {
      const _e = error as { message?: string };
      console.error("Error creating invoice:", error);
      if (_e.message?.includes("Rate limit")) {
        toast.error("Rate limit excedido", {
          description: "Aguarde alguns minutos e tente novamente",
        });
      } else if (_e.message?.includes("Payment required")) {
        toast.error("Créditos insuficientes", {
          description: "Adicione créditos à sua conta",
        });
      } else {
        toast.error("Erro ao criar invoice", {
          description: _e.message || "Tente novamente",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: CryptoInvoice["status"]) => {
    if (paymentData) {
      setPaymentData({ ...paymentData, status: newStatus });
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        icon={Bitcoin} 
        title="Crypto Pagamentos" 
        description="Pagamentos em criptomoeda e gestão de invoices" 
      />

      <div className="grid md:grid-cols-3 gap-4">
        <Card variant="metric" depth="subtle">
          <CardHeader>
            <Bitcoin className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Múltiplas Moedas</CardTitle>
            <CardDescription>
              Aceite BTC, ETH, USDT, LTC, DAI e Lightning Network
            </CardDescription>
          </CardHeader>
        </Card>

        <Card variant="metric" depth="subtle">
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-green-500" />
            <CardTitle>Seguro e Confiável</CardTitle>
            <CardDescription>
              Integração com BTCPay Server - Auto-custódia total
            </CardDescription>
          </CardHeader>
        </Card>

        <Card variant="metric" depth="subtle">
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-yellow-500" />
            <CardTitle>Processamento Rápido</CardTitle>
            <CardDescription>
              Confirmações em segundos via Lightning Network
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">Nova Cobrança</TabsTrigger>
          <TabsTrigger value="status" disabled={!activePaymentId}>
            Status
          </TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Invoice</CardTitle>
              <CardDescription>
                Gere uma invoice para receber pagamento em criptomoedas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (BRL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orderId">ID do Pedido/Tratamento</Label>
                  <Input
                    id="orderId"
                    placeholder="ORD-12345"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Invoice...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Criar Invoice
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {paymentData && (
            <CryptoPaymentCheckout
              paymentId={paymentData.paymentId}
              invoiceId={paymentData.invoiceId}
              checkoutLink={paymentData.checkoutLink}
              qrCodeData={paymentData.qrCodeData}
              amountBRL={parseFloat(amount)}
              expiresAt={paymentData.expiresAt}
              status={paymentData.status}
              onStatusChange={handleStatusChange}
            />
          )}
        </TabsContent>

        <TabsContent value="status">
          {activePaymentId && (
            <CryptoPaymentStatus
              paymentId={activePaymentId}
              onStatusChange={handleStatusChange}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <CryptoPaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
