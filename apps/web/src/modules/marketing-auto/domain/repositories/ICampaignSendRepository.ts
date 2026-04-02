import { CampaignSend, CampaignSendStatus } from "../entities/CampaignSend";

export interface CampaignSendFilters {
  campaignId?: string;
  patientId?: string;
  status?: CampaignSendStatus;
  hasError?: boolean;
}

export interface ICampaignSendRepository {
  findById(id: string): Promise<CampaignSend | null>;
  findByCampaign(
    campaignId: string,
    filters?: CampaignSendFilters,
  ): Promise<CampaignSend[]>;
  findByPatient(patientId: string): Promise<CampaignSend[]>;
  save(send: CampaignSend): Promise<void>;
  update(send: CampaignSend): Promise<void>;
  delete(id: string): Promise<void>;
  getScheduledSends(campaignId: string): Promise<CampaignSend[]>;
  getErrorSends(campaignId: string): Promise<CampaignSend[]>;
}
