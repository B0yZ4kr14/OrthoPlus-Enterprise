import { Campaign } from "../../domain/entities/Campaign";
import { CampaignCard } from "./CampaignCard";
import { Loader2 } from "lucide-react";

interface CampaignListProps {
  campaigns: Campaign[];
  loading: boolean;
  onActivate?: (campaignId: string) => void;
  onPause?: (campaignId: string) => void;
  onComplete?: (campaignId: string) => void;
  onViewDetails?: (campaign: Campaign) => void;
}

export function CampaignList({
  campaigns,
  loading,
  onActivate,
  onPause,
  onComplete,
  onViewDetails,
}: CampaignListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Nenhuma campanha encontrada
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Crie sua primeira campanha de marketing para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onActivate={() => onActivate?.(campaign.id)}
          onPause={() => onPause?.(campaign.id)}
          onComplete={() => onComplete?.(campaign.id)}
          onViewDetails={() => onViewDetails?.(campaign)}
        />
      ))}
    </div>
  );
}
