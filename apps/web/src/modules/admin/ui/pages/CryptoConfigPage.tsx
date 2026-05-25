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
import { Badge } from "@orthoplus/core-ui/badge";
import { Bitcoin, Wallet, TrendingUp, Bell, Key, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { useState } from "react";
import { useCryptoConfigPage } from "@/hooks/api/useCryptoConfigPage";
import { formatCurrency } from "@/lib/utils/formatting.utils";

interface Exchange {
  id: string;
  name: string;
  api_key: string;
  status: string;
}

interface Portfolio {
  total_value_usd: number;
  total_btc: number;
  assets: Array<{
    symbol: string;
    amount: number;
    value_usd: number;
  }>;
}

export default function CryptoConfigPage() {
  const {
    exchanges,
    portfolio,
    isLoading: loading,
    addExchange,
    isAdding,
  } = useCryptoConfigPage();

  const [newExchange, setNewExchange] = useState({
    name: "",
    api_key: "",
    api_secret: "",
  });

  const handleAddExchange = () => {
    addExchange({
      name: newExchange.name,
      config: newExchange.api_key,
      passphrase: newExchange.api_secret,
    });
    setNewExchange({ name: "", api_key: "", api_secret: "" });
  };

  const wrappedAddExchange = () => handleAddExchange();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bitcoin}
        title="Crypto Config"
        description="Gerencie exchanges, carteiras e estratégias de criptomoedas"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard
              title="Portfolio Total"
              value={
                portfolio ? formatCurrency(portfolio.total_value_usd, "USD") : "$0.00"
              }
              icon={Bitcoin}
              variant="primary"
              description={portfolio ? `${portfolio.total_btc.toFixed(8)} BTC` : undefined}
            />
            <StatsCard
              title="Exchanges"
              value={exchanges.length}
              icon={Wallet}
              variant="default"
              description="Conectadas"
            />
            <StatsCard
              title="Ativos"
              value={portfolio?.assets.length || 0}
              icon={TrendingUp}
              variant="success"
              description="Diferentes"
            />
          </div>

          <Tabs defaultValue="exchanges" className="w-full">
            <TabsList>
              <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="dca">DCA Strategies</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="exchanges" className="space-y-4">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Adicionar Exchange</CardTitle>
                  <CardDescription>
                    Configure uma nova exchange de criptomoedas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Nome da Exchange</Label>
                      <Input
                        placeholder="Binance, Coinbase, etc"
                        value={newExchange.name}
                        onChange={(e) =>
                          setNewExchange({
                            ...newExchange,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Sua API Key"
                        value={newExchange.api_key}
                        onChange={(e) =>
                          setNewExchange({
                            ...newExchange,
                            api_key: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input
                        type="password"
                        placeholder="Seu API Secret"
                        value={newExchange.api_secret}
                        onChange={(e) =>
                          setNewExchange({
                            ...newExchange,
                            api_secret: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={wrappedAddExchange}>
                    <Key className="mr-2 h-4 w-4" />
                    Adicionar Exchange
                  </Button>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Exchanges Configuradas</CardTitle>
                  <CardDescription>
                    Lista de exchanges conectadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {exchanges.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma exchange configurada
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exchanges.map((exchange) => (
                        <div
                          key={exchange.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Bitcoin className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{exchange.name}</div>
                              <div className="text-sm text-muted-foreground">
                                API Key: {exchange.config.substring(0, 10)}...
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              exchange.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {exchange.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card variant="elevated" className="glass-card">
                <CardHeader>
                  <CardTitle>Meu Portfolio</CardTitle>
                  <CardDescription>
                    Visualize seus ativos em criptomoedas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!portfolio || portfolio.assets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum ativo encontrado
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {portfolio.assets.map((asset, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Bitcoin className="h-5 w-5 text-orange-500" />
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-sm text-muted-foreground">
                                {asset.amount.toFixed(8)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(asset.value_usd, "USD")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dca">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Estratégias DCA</CardTitle>
                  <CardDescription>
                    Configure compras automáticas recorrentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Funcionalidade em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Alertas de Preço</CardTitle>
                  <CardDescription>
                    Configure notificações de variação de preço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Funcionalidade em desenvolvimento
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
