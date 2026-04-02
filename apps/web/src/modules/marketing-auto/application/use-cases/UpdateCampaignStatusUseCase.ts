import { Campaign, CampaignStatus } from "../../domain/entities/Campaign";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";

export interface UpdateCampaignStatusInput {
  campaignId: string;
  action: "activate" | "pause" | "complete";
}

export class UpdateCampaignStatusUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(input: UpdateCampaignStatusInput): Promise<Campaign> {
    // Buscar campanha
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign) {
      throw new Error("Campanha não encontrada");
    }

    // Executar ação
    switch (input.action) {
      case "activate":
        campaign.activate();
        break;
      case "pause":
        campaign.pause();
        break;
      case "complete":
        campaign.complete();
        break;
      default:
        throw new Error(`Ação desconhecida: ${input.action}`);
    }

    // Atualizar no repositório
    await this.campaignRepository.update(campaign);

    return campaign;
  }
}
