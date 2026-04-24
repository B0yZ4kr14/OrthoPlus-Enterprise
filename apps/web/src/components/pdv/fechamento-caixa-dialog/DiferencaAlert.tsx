import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import type { DiferencaInfo } from "./types";

interface DiferencaAlertProps {
  diferencaInfo: DiferencaInfo;
}

const ICONS = {
  surplus: AlertTriangle,
  shortage: AlertCircle,
  exact: CheckCircle2,
};

export function DiferencaAlert({ diferencaInfo }: DiferencaAlertProps) {
  const { type, message, variant } = diferencaInfo;
  const Icon = ICONS[type];

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
