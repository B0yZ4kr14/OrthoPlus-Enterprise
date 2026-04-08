import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@orthoplus/core-ui/tabs";
import { AdvancedTechnicalAnalysis } from "@/components/crypto/AdvancedTechnicalAnalysis";

export function CryptoTechnicalAnalysisView() {
  return (
    <>
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold">Análise Técnica Avançada</h3>
        <p className="text-sm text-muted-foreground">
          Indicadores técnicos profissionais (RSI, MACD, Bollinger Bands) e
          histórico de preços
        </p>
      </div>

      <Tabs defaultValue="BTC" className="w-full">
        <TabsList>
          <TabsTrigger value="BTC">Bitcoin (BTC)</TabsTrigger>
          <TabsTrigger value="ETH">Ethereum (ETH)</TabsTrigger>
          <TabsTrigger value="USDT">Tether (USDT)</TabsTrigger>
        </TabsList>
        <TabsContent value="BTC">
          <AdvancedTechnicalAnalysis coinType="BTC" />
        </TabsContent>
        <TabsContent value="ETH">
          <AdvancedTechnicalAnalysis coinType="ETH" />
        </TabsContent>
        <TabsContent value="USDT">
          <AdvancedTechnicalAnalysis coinType="USDT" />
        </TabsContent>
      </Tabs>
    </>
  );
}
