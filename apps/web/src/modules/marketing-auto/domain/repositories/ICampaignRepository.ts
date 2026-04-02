import { Campaign, CampaignType, CampaignStatus } from "../entities/Campaign";
import { Period } from "../../../financeiro/domain/valueObjects/Period";

export interface CampaignFilters {
  type?: CampaignType;
  status?: CampaignStatus;
  createdBy?: string;
  period?: Period;
}

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findByClinic(
    clinicId: string,
    filters?: CampaignFilters,
  ): Promise<Campaign[]>;
  save(campaign: Campaign): Promise<void>;
  update(campaign: Campaign): Promise<void>;
  delete(id: string): Promise<void>;
  getActiveCampaigns(clinicId: string): Promise<Campaign[]>;
  getScheduledCampaigns(clinicId: string): Promise<Campaign[]>;
}
