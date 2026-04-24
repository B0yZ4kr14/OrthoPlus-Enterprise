import { CheckCircle } from "lucide-react";
import { getTextColorClass } from "./utils";

interface StrengthLabelProps {
  password: string;
  label: string;
  color: string;
  score: number;
}

export function StrengthLabel({ password, label, color, score }: StrengthLabelProps) {
  if (password.length === 0) {
    return <p className="text-sm font-medium text-muted-foreground">Digite uma senha</p>;
  }

  return (
    <div className="flex items-center justify-between">
      <p className={`text-sm font-medium transition-colors ${getTextColorClass(color)}`}>
        {label}
      </p>
      {score === 4 && <CheckCircle className="h-4 w-4 text-green-500" />}
    </div>
  );
}
