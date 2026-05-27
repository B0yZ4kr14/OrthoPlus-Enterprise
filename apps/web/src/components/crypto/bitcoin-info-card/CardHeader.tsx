import { Bitcoin } from "lucide-react";
import { CardTitle } from "@orthoplus/core-ui/card";
import { Button } from "@orthoplus/core-ui/button";
import { CollapsibleTrigger } from "@orthoplus/core-ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CardHeaderProps {
  isOpen: boolean;
}

export function BitcoinCardHeader({ isOpen }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-warning/10">
          <Bitcoin className="h-6 w-6 text-warning" />
        </div>
        <div>
          <CardTitle className="text-lg">
            Pagamentos em Bitcoin e Criptomoedas
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Receba pagamentos de forma rápida, segura e com taxas reduzidas
          </p>
        </div>
      </div>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {isOpen ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Saiba Mais
            </>
          )}
        </Button>
      </CollapsibleTrigger>
    </div>
  );
}
