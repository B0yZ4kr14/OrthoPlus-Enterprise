import { CardHeader, CardTitle, CardDescription } from "@orthoplus/core-ui/card";
import { Megaphone } from "lucide-react";

export function MarketingHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Megaphone className="h-5 w-5" />
        Origem do Paciente - Inteligência Comercial
      </CardTitle>
      <CardDescription>
        Rastreamento de origem para análise de ROI de campanhas e canais de captação
      </CardDescription>
    </CardHeader>
  );
}
