import { Line } from "recharts";

export function RSILine() {
  return (
    <Line
      type="monotone"
      dataKey="rsi"
      stroke="hsl(var(--primary))"
      strokeWidth={2}
      dot={false}
      name="RSI (14)"
    />
  );
}

export function OverboughtLine() {
  return (
    <Line
      type="monotone"
      dataKey={() => 70}
      stroke="hsl(var(--destructive))"
      strokeDasharray="5 5"
      dot={false}
      name="Sobrecompra (70)"
    />
  );
}

export function OversoldLine() {
  return (
    <Line
      type="monotone"
      dataKey={() => 30}
      stroke="hsl(var(--success))"
      strokeDasharray="5 5"
      dot={false}
      name="Sobrevenda (30)"
    />
  );
}
