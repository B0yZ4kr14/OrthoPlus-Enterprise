import { apiClient } from "@/lib/api/apiClient";
import {
  Campaign,
  CampaignMetrics,
  CampaignProps,
  CampaignStatus,
  CampaignType,
  TargetSegment,
} from "../../domain/entities/Campaign";
import {
  CampaignFilters,
  ICampaignRepository,
} from "../../domain/repositories/ICampaignRepository";
import { MessageTemplate } from "../../domain/valueObjects/MessageTemplate";

export class CampaignRepositoryApi implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`/marketing/campanhas/${id}`);
      if (!data) return null;
      return this.toDomain(data);
    } catch (error: unknown) {
      const _e = error as { response?: { status?: number; data?: { error?: string } }; message?: string };
      if (_e.response?.status === 404 || _e.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar campanha: ${_e.message}`);
    }
  }

  async findByClinic(
    clinicId: string,
    filters?: CampaignFilters,
  ): Promise<Campaign[]> {
    try {
      const params: Record<string, unknown> = {};

      if (filters?.type) params.type = filters.type;
      if (filters?.status) params.status = filters.status;
      if (filters?.createdBy) params.created_by = filters.createdBy;
      if (filters?.period) {
        params.start_date = filters.period.startDate.toISOString();
        params.end_date = filters.period.endDate.toISOString();
      }

      const data = await apiClient.get<Record<string, any>[]>("/marketing/campanhas", {
        params,
      });
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar campanhas da clínica: ${_e.message}`);
    }
  }

  async save(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    try {
      await apiClient.post("/marketing/campanhas", data);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao salvar campanha: ${_e.message}`);
    }
  }

  async update(campaign: Campaign): Promise<void> {
    const data = this.toDatabase(campaign);
    try {
      await apiClient.patch(`/marketing/campanhas/${campaign.id}`, data);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar campanha: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/marketing/campanhas/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar campanha: ${_e.message}`);
    }
  }

  async getActiveCampaigns(clinicId: string): Promise<Campaign[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/marketing/campanhas", {
        params: { status: "ATIVA" },
      });
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar campanhas ativas: ${_e.message}`);
    }
  }

  async getScheduledCampaigns(clinicId: string): Promise<Campaign[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/marketing/campanhas", {
        params: { status: "ATIVA", scheduled: true },
      });
      return data?.map((row) => this.toDomain(row)) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar campanhas agendadas: ${_e.message}`);
    }
  }

  private toDomain(row: Record<string, any>): Campaign {
    const messageTemplate = new MessageTemplate(row.message_template || "");

    const metrics: CampaignMetrics | undefined =
      row.total_sent !== null
        ? {
            totalSent: row.total_sent || 0,
            totalDelivered: row.total_delivered || 0,
            totalOpened: row.total_opened || 0,
            totalClicked: row.total_clicked || 0,
            totalConverted: row.total_converted || 0,
            totalErrors: row.total_errors || 0,
          }
        : undefined;

    const targetSegment: TargetSegment | undefined = row.target_segment
      ? typeof row.target_segment === "string"
        ? JSON.parse(row.target_segment)
        : row.target_segment
      : undefined;

    const props: CampaignProps = {
      id: row.id,
      clinicId: row.clinic_id,
      name: row.name,
      description: row.description,
      type: row.type as CampaignType,
      status: row.status as CampaignStatus,
      messageTemplate,
      targetSegment,
      scheduledDate: row.scheduled_date
        ? new Date(row.scheduled_date)
        : undefined,
      startDate: row.start_date ? new Date(row.start_date) : undefined,
      endDate: row.end_date ? new Date(row.end_date) : undefined,
      metrics,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new Campaign(props);
  }

  private toDatabase(campaign: Campaign): unknown {
    return {
      id: campaign.id,
      clinic_id: campaign.clinicId,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      status: campaign.status,
      message_template: campaign.messageTemplate.getTemplate(),
      target_segment: campaign.targetSegment
        ? JSON.stringify(campaign.targetSegment)
        : null,
      scheduled_date: campaign.scheduledDate?.toISOString(),
      start_date: campaign.startDate?.toISOString(),
      end_date: campaign.endDate?.toISOString(),
      total_sent: campaign.metrics?.totalSent,
      total_delivered: campaign.metrics?.totalDelivered,
      total_opened: campaign.metrics?.totalOpened,
      total_clicked: campaign.metrics?.totalClicked,
      total_converted: campaign.metrics?.totalConverted,
      total_errors: campaign.metrics?.totalErrors,
      created_by: campaign.createdBy,
      created_at: campaign.createdAt.toISOString(),
      updated_at: campaign.updatedAt.toISOString(),
    };
  }
}
