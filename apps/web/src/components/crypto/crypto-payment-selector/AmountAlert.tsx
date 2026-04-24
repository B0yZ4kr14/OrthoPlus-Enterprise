import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { Bitcoin } from "lucide-react";

interface AmountAlertProps {
  amount: number;
  coin: string;
}

export function AmountAlert({ amount, coin }: AmountAlertProps) {
  // Taxa de conversão simulada (em produção, usar API real)
  const rate = coin === "BTC" ? 350000 : coin === "ETH" ? 18000 : 5.5;
  const cryptoAmount = (amount / rate).toFixed(8);

  return (
    <Alert className="bg-primary/5 border-primary/20">
      <Bitcoin className="h-4 w-4 text-primary" />
      <AlertDescription>
        <strong>Valor a receber:</strong> R$ {amount.toFixed(2)} (~{cryptoAmount} {coin})
      </AlertDescription>
    </Alert>
  );
}
