import { CampaignSend } from "../../domain/entities/CampaignSend";
import {
  ICampaignSendRepository,
  CampaignSendFilters,
} from "../../domain/repositories/ICampaignSendRepository";

export interface ListCampaignSendsInput {
  campaignId: string;
  filters?: CampaignSendFilters;
}

export class ListCampaignSendsUseCase {
  constructor(private campaignSendRepository: ICampaignSendRepository) {}

  async execute(input: ListCampaignSendsInput): Promise<CampaignSend[]> {
    return await this.campaignSendRepository.findByCampaign(
      input.campaignId,
      input.filters,
    );
  }
}
