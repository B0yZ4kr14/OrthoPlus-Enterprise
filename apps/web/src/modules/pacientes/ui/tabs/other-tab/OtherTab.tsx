import { Card } from "@orthoplus/core-ui/card";
import type { OtherTabProps } from "./types";
import { FinancialSection } from "./FinancialSection";
import { ConsentSection } from "./ConsentSection";

export function OtherTab({ form }: OtherTabProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FinancialSection form={form} />
        <ConsentSection form={form} />
      </div>
    </Card>
  );
}
