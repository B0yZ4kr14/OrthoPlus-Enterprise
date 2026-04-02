import { CampaignMetrics } from "../../domain/entities/Campaign";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";

export interface GetCampaignMetricsInput {
  campaignId: string;
}

export interface CampaignMetricsResult extends CampaignMetrics {
  openRate: number;
  clickRate: number;
  conversionRate: number;
  errorRate: number;
}

export class GetCampaignMetricsUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(
    input: GetCampaignMetricsInput,
  ): Promise<CampaignMetricsResult> {
    // Buscar campanha
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign) {
      throw new Error("Campanha não encontrada");
    }

    const metrics = campaign.metrics || {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalConverted: 0,
      totalErrors: 0,
    };

    return {
      ...metrics,
      openRate: campaign.getOpenRate(),
      clickRate: campaign.getClickRate(),
      conversionRate: campaign.getConversionRate(),
      errorRate: campaign.getErrorRate(),
    };
  }
}
