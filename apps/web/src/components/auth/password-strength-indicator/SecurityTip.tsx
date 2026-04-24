import { Info } from "lucide-react";

export function SecurityTip() {
  return (
    <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
      <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-700 dark:text-amber-300">
        <strong>Dica:</strong> Use uma combinação de letras, números e símbolos. Evite
        sequências óbvias (123, abc) e informações pessoais.
      </p>
    </div>
  );
}
