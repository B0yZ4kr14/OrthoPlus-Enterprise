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
      <div className="p-4 bg-info/10 rounded-lg border border-info/20">
        <p className="text-sm text-muted-foreground mb-1">Valor Inicial</p>
        <p className="text-2xl font-bold">
          R${" "}
          {valorInicial.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
      <div className="p-4 bg-success/10 rounded-lg border border-success/20">
        <p className="text-sm text-muted-foreground mb-1">Valor Esperado</p>
        <p className="text-2xl font-bold text-success">
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
              ? "bg-success/10 border-success/20"
              : "bg-destructive/10 border-destructive/20"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Diferença</p>
          <p className={`text-2xl font-bold ${diferenca > 0 ? "text-success" : "text-destructive"}`}>
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
