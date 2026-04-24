export interface CampaignSourceSelectorProps {
  value: {
    campaignId?: string;
    channel?: string;
    source?: string;
  };
  onChange: (value: CampaignSourceSelectorProps["value"]) => void;
  clinicId?: string;
}

export interface DentalCampaign {
  id: string;
  name: string;
  channel: string;
  roi: number;
  leads: number;
  investment: number;
}

export interface CaptureChannel {
  id: string;
  name: string;
  sources: string[];
}

export interface CampaignSourceValue {
  campanha_origem_id?: string;
  canal_captacao?: string;
  origem_lead?: string;
  evento_captacao?: string;
}
