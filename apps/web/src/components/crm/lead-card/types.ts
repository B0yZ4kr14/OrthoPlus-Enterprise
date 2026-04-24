import type { Lead, LeadStatus } from "@/modules/crm/domain/entities/Lead";

export type { Lead, LeadStatus };

export interface LeadCardProps {
  lead: Lead;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onClick?: () => void;
}
