export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatChange(change: number): { text: string; isPositive: boolean } {
  const isPositive = change >= 0;
  const formattedValue =
    typeof change === "number" ? change.toFixed(2) : "0.00";
  const sign = isPositive ? "+" : "";

  return {
    text: `${sign}${formattedValue}%`,
    isPositive,
  };
}
