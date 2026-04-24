import { Card } from "@orthoplus/core-ui/card";
import type { LeadCardProps } from "./types";
import { LeadHeader } from "./components/LeadHeader";
import { LeadContactInfo } from "./components/LeadContactInfo";
import { LeadTags } from "./components/LeadTags";

export * from "./types";
export { LeadHeader, LeadContactInfo, LeadTags };
export { statusLabels, statusColors } from "./constants/status";

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        <LeadHeader lead={lead} />
        <LeadContactInfo lead={lead} />
        <LeadTags tags={lead.tags || []} />
      </div>
    </Card>
  );
}
