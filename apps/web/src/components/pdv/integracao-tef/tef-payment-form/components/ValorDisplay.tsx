interface ValorDisplayProps {
  valorTotal: number;
}

export function ValorDisplay({ valorTotal }: ValorDisplayProps) {
  return (
    <div className="bg-muted p-4 rounded-lg">
      <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
      <p className="text-2xl font-bold">R$ {valorTotal.toFixed(2)}</p>
    </div>
  );
}
