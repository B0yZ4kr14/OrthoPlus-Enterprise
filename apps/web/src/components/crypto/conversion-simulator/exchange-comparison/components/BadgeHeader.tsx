import { Award } from "lucide-react";
import { Badge } from "@orthoplus/core-ui/badge";

interface BadgeHeaderProps {
  bestExchange?: string;
}

export function BadgeHeader({ bestExchange }: BadgeHeaderProps) {
  if (!bestExchange) return <span>Comparativo de Taxas por Exchange</span>;

  return (
    <>
      <span>Comparativo de Taxas por Exchange</span>
      <Badge variant="outline" className="gap-2">
        <Award className="h-4 w-4" />
        Melhor: {bestExchange}
      </Badge>
    </>
  );
}
