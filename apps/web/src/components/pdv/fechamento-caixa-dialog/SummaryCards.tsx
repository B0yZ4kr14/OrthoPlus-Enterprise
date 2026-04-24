interface SummaryCardsProps {
  valorInicial: number;
  valorEsperado: number;
  hasDiferenca: boolean;
  diferenca: number;
}

export function SummaryCards({
  valorInicial,
  valorEsperado,
  hasDiferenca,
  diferenca,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-sm text-muted-foreground mb-1">Valor Inicial</p>
        <p className="text-2xl font-bold">
          R${" "}
          {valorInicial.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
        <p className="text-sm text-muted-foreground mb-1">Valor Esperado</p>
        <p className="text-2xl font-bold text-green-600">
          R${" "}
          {valorEsperado.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      {hasDiferenca && (
        <div
          className={`p-4 rounded-lg border ${
            diferenca > 0
              ? "bg-green-500/10 border-green-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Diferença</p>
          <p className={`text-2xl font-bold ${diferenca > 0 ? "text-green-600" : "text-red-600"}`}>
            {diferenca > 0 ? "+" : ""}R${" "}
            {Math.abs(diferenca).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
