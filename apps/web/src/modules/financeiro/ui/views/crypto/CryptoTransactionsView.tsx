import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import {
  Settings,
  Wallet,
  Plus,
  QrCode,
  ExternalLink,
  RefreshCw,
  ArrowRightLeft,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  coinLabels,
  statusLabels,
  tipoLabels,
  CryptoTransactionComplete,
  CryptoWallet,
  ExchangeConfig,
} from "@/modules/crypto/types/crypto.types";

export interface CryptoTransactionsViewProps {
  exchanges: ExchangeConfig[];
  wallets: CryptoWallet[];
  transactions: CryptoTransactionComplete[];
  convertingTx: string | null;
  setConvertingTx: (id: string | null) => void;
  setExchangeDialogOpen: (open: boolean) => void;
  setWalletDialogOpen: (open: boolean) => void;
  setQrCodeDialogOpen: (open: boolean) => void;
  convertCryptoToBRL: (txId: string) => Promise<any>;
}

export function CryptoTransactionsView({
  exchanges,
  wallets,
  transactions,
  convertingTx,
  setConvertingTx,
  setExchangeDialogOpen,
  setWalletDialogOpen,
  setQrCodeDialogOpen,
  convertCryptoToBRL,
}: CryptoTransactionsViewProps) {
  const handleConvert = async (txId: string) => {
    try {
      setConvertingTx(txId);
      await convertCryptoToBRL(txId);
    } finally {
      setConvertingTx(null);
    }
  };

  if (exchanges.length === 0) {
    return (
      <Card depth="normal" className="p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Settings className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Configure sua primeira Exchange
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Para começar a receber pagamentos em criptomoedas, você precisa
              configurar uma exchange (Binance, Coinbase, etc.)
            </p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-4">
              <strong>Dica:</strong> Você pode gerar suas credenciais API na seção
              de API Management da sua conta na exchange. Certifique-se de habilitar
              apenas as permissões necessárias (leitura de saldo e histórico).
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setExchangeDialogOpen(true)} size="lg">
              <Settings className="h-5 w-5 mr-2" />
              Configurar Exchange
            </Button>
          </div>
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="font-semibold mb-1">Binance</p>
                <p className="text-muted-foreground text-xs">
                  Maior volume global
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="font-semibold mb-1">Coinbase</p>
                <p className="text-muted-foreground text-xs">
                  Interface amigável
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="font-semibold mb-1">Mercado Bitcoin</p>
                <p className="text-muted-foreground text-xs">
                  Exchange brasileira
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (wallets.length === 0) {
    return (
      <Card depth="normal" className="p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-orange-500/10 p-6">
              <Wallet className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Crie sua primeira Carteira
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Agora que você já configurou uma exchange, crie uma carteira para
              receber pagamentos em Bitcoin, Ethereum ou outras criptomoedas.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setWalletDialogOpen(true)}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Carteira
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Histórico de Transações</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQrCodeDialogOpen(true)}
          disabled={wallets.filter((w) => w.is_active).length === 0}
        >
          <QrCode className="h-4 w-4 mr-2" />
          Gerar QR Code de Pagamento
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhuma transação encontrada. Gere um QR Code para receber seu
            primeiro pagamento!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {coinLabels[tx.coin_type as keyof typeof coinLabels] ||
                          tx.coin_type}
                      </Badge>
                      <Badge
                        variant={
                          tx.status === "CONFIRMADO"
                            ? "default"
                            : tx.status === "PENDENTE"
                              ? "secondary"
                              : tx.status === "CONVERTIDO"
                                ? "default"
                                : "destructive"
                        }
                      >
                        {statusLabels[tx.status]}
                      </Badge>
                      <Badge variant="outline">{tipoLabels[tx.tipo]}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Valor Crypto:
                        </span>
                        <p className="font-semibold">
                          {tx.amount_crypto} {tx.coin_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor BRL:</span>
                        <p className="font-semibold">
                          R${" "}
                          {tx.amount_brl?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Taxa de Câmbio:
                        </span>
                        <p className="font-semibold">
                          R${" "}
                          {tx.exchange_rate?.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Confirmações:
                        </span>
                        <p className="font-semibold">
                          {tx.confirmations}/{tx.required_confirmations}
                        </p>
                      </div>
                    </div>

                    {tx.processing_fee_brl && tx.processing_fee_brl > 0 && (
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground">
                            Taxa de Processamento:
                          </span>
                          <p className="font-semibold text-warning">
                            - R${" "}
                            {tx.processing_fee_brl?.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                            {tx.processing_fee_percentage &&
                              ` (${tx.processing_fee_percentage}%)`}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Valor Líquido:
                          </span>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            R${" "}
                            {tx.net_amount_brl?.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {tx.patient_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Paciente: </span>
                        <span className="font-medium">{tx.patient_name}</span>
                      </div>
                    )}

                    {tx.transaction_hash && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Hash:</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {tx.transaction_hash.substring(0, 20)}...
                        </code>
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://blockchain.com/btc/tx/${tx.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver na Blockchain"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {format(
                        new Date(tx.created_at || new Date()),
                        "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {tx.status === "CONFIRMADO" && !tx.converted_to_brl_at && (
                      <Button
                        size="sm"
                        onClick={() => handleConvert(tx.id || "")}
                        disabled={convertingTx === tx.id}
                      >
                        {convertingTx === tx.id ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Convertendo...
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Converter
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
