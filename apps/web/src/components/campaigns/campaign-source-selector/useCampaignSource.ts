import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DentalCampaign, CaptureChannel } from "@/types/patient-crm";
import type { CampaignSourceValue } from "./types";

interface UseCampaignSourceProps {
  clinicId: string;
  value: CampaignSourceValue;
  onChange: (value: CampaignSourceValue & { campanha_origem_nome: string | null }) => void;
}

export function useCampaignSource({ clinicId, value, onChange }: UseCampaignSourceProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<DentalCampaign | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<DentalCampaign[]>({
    queryKey: ["campaigns", clinicId],
    queryFn: async () => {
      return [] as DentalCampaign[];
    },
    enabled: !!clinicId,
  });

  const handleCampaignChange = useCallback(
    (campaignId: string) => {
      const campaign = campaigns.find((c) => c.id === campaignId);
      setSelectedCampaign(campaign || null);

      onChange({
        campanha_origem_id: campaignId,
        campanha_origem_nome: campaign?.nome || null,
        canal_captacao: value.canal_captacao,
        origem_lead: value.origem_lead,
        evento_captacao: value.evento_captacao,
      });
    },
    [campaigns, value, onChange],
  );

  const handleChannelChange = useCallback(
    (channel: CaptureChannel) => {
      onChange({
        ...value,
        campanha_origem_id: value.campanha_origem_id,
        campanha_origem_nome: selectedCampaign?.nome || null,
        canal_captacao: channel,
      });
    },
    [value, selectedCampaign, onChange],
  );

  const handleOriginChange = useCallback(
    (origin: string) => {
      onChange({
        ...value,
        campanha_origem_id: value.campanha_origem_id,
        campanha_origem_nome: selectedCampaign?.nome || null,
        origem_lead: origin,
      });
    },
    [value, selectedCampaign, onChange],
  );

  const handleEventChange = useCallback(
    (event: string) => {
      onChange({
        ...value,
        campanha_origem_id: value.campanha_origem_id,
        campanha_origem_nome: selectedCampaign?.nome || null,
        evento_captacao: event,
      });
    },
    [value, selectedCampaign, onChange],
  );

  const showEventInput =
    value.canal_captacao === "EVENTO_SAUDE" || value.canal_captacao === "OUTRO";

  return {
    campaigns,
    selectedCampaign,
    isLoading,
    showEventInput,
    handleCampaignChange,
    handleChannelChange,
    handleOriginChange,
    handleEventChange,
  };
}
