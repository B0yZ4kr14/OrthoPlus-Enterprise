import {
  Campaign,
  CampaignType,
  TargetSegment,
} from "../../domain/entities/Campaign";
import { ICampaignRepository } from "../../domain/repositories/ICampaignRepository";
import { MessageTemplate } from "../../domain/valueObjects/MessageTemplate";

export interface CreateCampaignInput {
  clinicId: string;
  name: string;
  description?: string;
  type: CampaignType;
  messageTemplate: string;
  targetSegment?: TargetSegment;
  scheduledDate?: Date;
  createdBy: string;
}

export class CreateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(input: CreateCampaignInput): Promise<Campaign> {
    // Validar template de mensagem
    const messageTemplate = new MessageTemplate(input.messageTemplate);

    // Criar campanha
    const campaign = new Campaign({
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      name: input.name,
      description: input.description,
      type: input.type,
      status: "RASCUNHO",
      messageTemplate,
      targetSegment: input.targetSegment,
      scheduledDate: input.scheduledDate,
      createdBy: input.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Salvar no repositório
    await this.campaignRepository.save(campaign);

    return campaign;
  }
}
