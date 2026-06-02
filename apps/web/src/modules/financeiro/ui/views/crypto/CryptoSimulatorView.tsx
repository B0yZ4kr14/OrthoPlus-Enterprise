import { ConversionSimulator } from "@/components/crypto/ConversionSimulator";

export function CryptoSimulatorView() {
  return (
    <>
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-semibold">
          Simulador de Conversão Cripto → BRL
        </h3>
        <p className="text-sm text-muted-foreground">
          Compare taxas entre exchanges e identifique o melhor momento para
          converter baseado em histórico
        </p>
      </div>

      <ConversionSimulator />
    </>
  );
}
