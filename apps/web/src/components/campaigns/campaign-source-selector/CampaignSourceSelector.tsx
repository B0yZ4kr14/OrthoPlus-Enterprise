import { useCampaignSourceSelector } from "./useCampaignSourceSelector";
import { CampaignSelect } from "./CampaignSelect";
import { ChannelSelect } from "./ChannelSelect";
import type { CampaignSourceSelectorProps } from "./types";

export function CampaignSourceSelector({
  value,
  onChange,
  clinicId,
}: CampaignSourceSelectorProps) {
  const {
    campaigns,
    captureChannels,
    selectedCampaign,
    selectedChannel,
    isLoading,
    handleCampaignChange,
    handleChannelChange,
    handleSourceChange,
  } = useCampaignSourceSelector(value, onChange, clinicId);

  if (isLoading) {
    return <div className="text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <CampaignSelect
        value={value.campaignId || ""}
        campaigns={campaigns}
        selectedCampaign={selectedCampaign}
        onChange={handleCampaignChange}
      />

      <ChannelSelect
        value={value.channel || ""}
        channels={captureChannels}
        selectedChannel={selectedChannel}
        sourceValue={value.source || ""}
        onChannelChange={handleChannelChange}
        onSourceChange={handleSourceChange}
      />
    </div>
  );
}
