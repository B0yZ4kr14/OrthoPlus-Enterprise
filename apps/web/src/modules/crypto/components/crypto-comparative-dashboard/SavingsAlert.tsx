// cspell:disable
import { TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";

interface SavingsAlertProps {
  totalSavings: number;
}

export function SavingsAlert({ totalSavings }: SavingsAlertProps) {
  if (totalSavings <= 100) return null;

  return (
    <Alert className="bg-green-500/10 border-green-500/50">
      <TrendingUp className="h-4 w-4 text-green-500" />
      <AlertDescription className="text-green-700 dark:text-green-300">
        <strong>Excelente!</strong> Você está economizando{" "}
        <strong>
          R${" "}
          {totalSavings.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </strong>{" "}
        em taxas usando pagamentos em criptomoedas comparado a métodos
        tradicionais.
      </AlertDescription>
    </Alert>
  );
}
