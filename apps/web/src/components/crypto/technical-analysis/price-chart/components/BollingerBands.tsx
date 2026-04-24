import { Area, Line } from "recharts";

export function UpperBandArea() {
  return (
    <Area
      type="monotone"
      dataKey="upperBand"
      stroke="hsl(var(--primary))"
      fill="hsl(var(--primary))"
      fillOpacity={0.1}
      name="Banda Superior"
    />
  );
}

export function LowerBandArea() {
  return (
    <Area
      type="monotone"
      dataKey="lowerBand"
      stroke="hsl(var(--primary))"
      fill="hsl(var(--primary))"
      fillOpacity={0.1}
      name="Banda Inferior"
    />
  );
}

export function SMALine() {
  return (
    <Line
      type="monotone"
      dataKey="sma"
      stroke="hsl(var(--muted-foreground))"
      strokeWidth={2}
      dot={false}
      name="SMA (20)"
    />
  );
}

export function PriceLine() {
  return (
    <Line
      type="monotone"
      dataKey="price"
      stroke="hsl(var(--primary))"
      strokeWidth={3}
      dot={false}
      name="Preço"
    />
  );
}
