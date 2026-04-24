import { Label } from "@orthoplus/core-ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orthoplus/core-ui/select";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import type { DentalCampaign } from "./types";

interface CampaignSelectProps {
  value: string;
  campaigns: DentalCampaign[];
  selectedCampaign: DentalCampaign | null;
  onChange: (value: string) => void;
}

function CampaignDetails({ campaign }: { campaign: DentalCampaign }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        ROI: {campaign.roi}%
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Leads: {campaign.leads}
      </div>
      <div className="flex items-center gap-1">
        <DollarSign className="h-3 w-3" />
        Investimento: R$ {campaign.investment}
      </div>
    </div>
  );
}

export function CampaignSelect({ value, campaigns, selectedCampaign, onChange }: CampaignSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="campaign">Campanha</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="campaign">
          <SelectValue placeholder="Selecione uma campanha" />
        </SelectTrigger>
        <SelectContent>
          {campaigns.length === 0 ? (
            <SelectItem value="none" disabled>
              Nenhuma campanha ativa
            </SelectItem>
          ) : (
            campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {selectedCampaign && (
        <div className="p-3 bg-muted rounded-md">
          <div className="font-medium text-sm">{selectedCampaign.name}</div>
          <CampaignDetails campaign={selectedCampaign} />
        </div>
      )}
    </div>
  );
}
