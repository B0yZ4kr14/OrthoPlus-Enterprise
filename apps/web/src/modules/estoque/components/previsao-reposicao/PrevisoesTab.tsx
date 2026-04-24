// cspell:disable
import { PrevisaoCard } from "./PrevisaoCard";
import type { Previsao } from "./types";

interface PrevisoesTabProps {
  previsoes: Previsao[];
}

export function PrevisoesTab({ previsoes }: PrevisoesTabProps) {
  return (
    <div className="space-y-4 mt-4">
      {previsoes.map((p, i) => (
        <PrevisaoCard key={i} previsao={p} />
      ))}
    </div>
  );
}
