// cspell:disable
import { Card, CardContent, CardHeader, CardTitle } from "@orthoplus/core-ui/card";
import { ComparativoCard } from "./ComparativoCard";
import type { Previsao } from "./types";

interface ComparativoTabProps {
  previsoes: Previsao[];
}

export function ComparativoTab({ previsoes }: ComparativoTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Comparativo IA vs Tradicional</CardTitle>
        </CardHeader>
        <CardContent>
          {previsoes.map((p, i) => (
            <ComparativoCard key={i} previsao={p} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
