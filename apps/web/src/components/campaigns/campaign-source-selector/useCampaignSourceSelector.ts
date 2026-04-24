import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CampaignSourceSelectorProps, DentalCampaign, CaptureChannel } from "./types";

const CAPTURE_CHANNELS: CaptureChannel[] = [
  { id: "social", name: "Redes Sociais", sources: ["Instagram", "Facebook", "LinkedIn", "TikTok"] },
  { id: "google", name: "Google Ads", sources: ["Pesquisa", "Display", "YouTube"] },
  { id: "organic", name: "Orgânico", sources: ["SEO", "Indicação", "Local"] },
  { id: "partnership", name: "Parcerias", sources: ["Convênios", "Empresas", "Eventos"] },
];

export function useCampaignSourceSelector(
  value: CampaignSourceSelectorProps["value"],
  onChange: CampaignSourceSelectorProps["onChange"],
  clinicId?: string
) {
  const [selectedCampaign, setSelectedCampaign] = useState<DentalCampaign | null>(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", clinicId],
    queryFn: async () => {
      // Mock data for demonstration
      return [] as DentalCampaign[];
    },
    enabled: !!clinicId,
  });

  const selectedChannel = useMemo(
    () => CAPTURE_CHANNELS.find((c) => c.id === value.channel) || null,
    [value.channel]
  );

  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      const campaign = campaigns.find((c) => c.id === campaignId) || null;
      setSelectedCampaign(campaign);
      onChange({ ...value, campaignId, channel: campaign?.channel || "" });
    },
    [campaigns, value, onChange]
  );

  const handleChannelChange = useCallback(
    (channelId: string) => {
      onChange({ ...value, channel: channelId, source: "" });
    },
    [value, onChange]
  );

  const handleSourceChange = useCallback(
    (source: string) => {
      onChange({ ...value, source });
    },
    [value, onChange]
  );

  return {
    campaigns,
    captureChannels: CAPTURE_CHANNELS,
    selectedCampaign,
    selectedChannel,
    isLoading,
    handleCampaignChange,
    handleChannelChange,
    handleSourceChange,
  };
}
