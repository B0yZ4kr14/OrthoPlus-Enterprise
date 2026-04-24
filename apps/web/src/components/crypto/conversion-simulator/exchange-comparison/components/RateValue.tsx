interface RateValueProps {
  label: string;
  value: number;
  highlight?: boolean;
  prefix?: string;
}

export function RateValue({ label, value, highlight, prefix = "R$ " }: RateValueProps) {
  return (
    <div>
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className={`font-semibold ${highlight ? "text-success" : ""}`}>
        {prefix}
        {value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
        })}
      </p>
    </div>
  );
}
