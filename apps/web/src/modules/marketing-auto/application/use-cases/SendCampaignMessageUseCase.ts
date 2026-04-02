import { CampaignSend } from "../../domain/entities/CampaignSend";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";
import { ICampaignSendRepository } from "../../domain/repositories/ICampaignSendRepository";

export interface SendCampaignMessageInput {
  campaignId: string;
  patientId: string;
  recipientName: string;
  recipientContact: string;
  variables: Record<string, string>; // Variáveis para renderizar o template
  scheduledFor?: Date;
}

export class SendCampaignMessageUseCase {
  constructor(
    private campaignRepository: ICampaignRepository,
    private campaignSendRepository: ICampaignSendRepository,
  ) {}

  async execute(input: SendCampaignMessageInput): Promise<CampaignSend> {
    // Buscar campanha
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign) {
      throw new Error("Campanha não encontrada");
    }

    if (!campaign.isActive() && !campaign.isDraft()) {
      throw new Error("Campanha não está ativa ou em rascunho");
    }

    // Renderizar mensagem com as variáveis
    const messageContent = campaign.messageTemplate.render(input.variables);

    // Criar envio
    const send = new CampaignSend({
      id: crypto.randomUUID(),
      campaignId: input.campaignId,
      patientId: input.patientId,
      recipientName: input.recipientName,
      recipientContact: input.recipientContact,
      messageContent,
      status: "AGENDADO",
      scheduledFor: input.scheduledFor || new Date(),
      retryCount: 0,
      createdAt: new Date(),
    });

    // Salvar no repositório
    await this.campaignSendRepository.save(send);

    // Atualizar métricas da campanha (incrementar totalSent)
    campaign.updateMetrics({
      totalSent: (campaign.metrics?.totalSent || 0) + 1,
    });
    await this.campaignRepository.update(campaign);

    return send;
  }
}
