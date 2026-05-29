import { Card, CardContent, CardHeader } from "@orthoplus/core-ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@orthoplus/core-ui/collapsible";
import { useBitcoinInfoCard } from "./useBitcoinInfoCard";
import { BitcoinCardHeader } from "./CardHeader";
import { AdvantagesGrid } from "./AdvantagesGrid";
import { ProcessSteps } from "./ProcessSteps";
import { ExchangesList } from "./ExchangesList";

export function BitcoinInfoCard() {
  const { isOpen } = useBitcoinInfoCard();

  return (
    <Card
      depth="normal"
      className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-500/5 to-transparent"
    >
      <Collapsible open={isOpen}>
        <CardHeader>
          <BitcoinCardHeader isOpen={isOpen} />
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            <AdvantagesGrid />
            <ProcessSteps />
            <ExchangesList />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
