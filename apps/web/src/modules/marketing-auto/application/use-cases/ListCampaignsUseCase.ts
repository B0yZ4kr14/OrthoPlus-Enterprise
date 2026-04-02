import { Campaign } from "../../domain/entities/Campaign";
import {
  ICampaignRepository,
  CampaignFilters,
} from "../../domain/repositories/ICampaignRepository";

export interface ListCampaignsInput {
  clinicId: string;
  filters?: CampaignFilters;
}

export class ListCampaignsUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(input: ListCampaignsInput): Promise<Campaign[]> {
    return await this.campaignRepository.findByClinic(
      input.clinicId,
      input.filters,
    );
  }
}
