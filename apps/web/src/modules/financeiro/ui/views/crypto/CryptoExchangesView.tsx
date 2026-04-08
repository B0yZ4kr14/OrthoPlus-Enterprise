import { Card, CardHeader, CardTitle, CardContent } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { Badge } from "@orthoplus/core-ui/badge";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Settings, Plus, AlertCircle } from "lucide-react";
import { ExchangeConfig, exchangeLabels } from "@/modules/crypto/types/crypto.types";

export interface CryptoExchangesViewProps {
  exchanges: ExchangeConfig[];
  setExchangeDialogOpen: (open: boolean) => void;
}

export function CryptoExchangesView({
  exchanges,
  setExchangeDialogOpen,
}: CryptoExchangesViewProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Exchanges Configuradas</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExchangeDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Exchange
        </Button>
      </div>

      {exchanges.length === 0 ? (
        <Card depth="normal" className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-500/10 p-6">
                <Settings className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                Nenhuma exchange configurada
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Configure uma exchange (Binance, Coinbase, Kraken, etc.) com
                suas credenciais API para começar.
              </p>
              <Alert className="mt-6 text-left max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Suas credenciais API são
                  armazenadas de forma segura e criptografada. Recomendamos
                  criar uma API Key com permissões somente de leitura para
                  maior segurança.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => setExchangeDialogOpen(true)} size="lg">
                <Settings className="h-5 w-5 mr-2" />
                Configurar Exchange
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exchanges.map((exchange) => (
            <Card
              key={exchange.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {exchangeLabels[exchange.exchange_name as keyof typeof exchangeLabels] || exchange.exchange_name}
                  </CardTitle>
                  <Badge
                    variant={exchange.is_active ? "default" : "secondary"}
                  >
                    {exchange.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Moedas Suportadas:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exchange.supported_coins?.map((coin) => (
                      <Badge
                        key={coin}
                        variant="outline"
                        className="text-xs"
                      >
                        {coin}
                      </Badge>
                    ))}
                  </div>
                </div>

                {exchange.wallet_address && (
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Carteira Principal:
                    </span>
                    <code className="block text-xs bg-muted p-2 rounded mt-1 break-all">
                      {exchange.wallet_address}
                    </code>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Conversão Automática:
                  </span>
                  <Badge
                    variant={
                      exchange.auto_convert_to_brl ? "default" : "outline"
                    }
                  >
                    {exchange.auto_convert_to_brl
                      ? "Ativada"
                      : "Desativada"}
                  </Badge>
                </div>

                {exchange.processing_fee_percentage &&
                  exchange.processing_fee_percentage > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Taxa de Processamento:{" "}
                      </span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {exchange.processing_fee_percentage}%
                      </span>
                    </div>
                  )}

                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
