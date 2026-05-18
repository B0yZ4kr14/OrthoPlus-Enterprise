import { Info } from "lucide-react";

export function SecurityTip() {
  return (
    <div className="flex items-start gap-2 p-2 bg-warning/10 rounded-md border border-warning/20">
      <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
      <p className="text-xs text-warning">
        <strong>Dica:</strong> Use uma combinação de letras, números e símbolos. Evite
        sequências óbvias (123, abc) e informações pessoais.
      </p>
    </div>
  );
}
