import { apiClient } from "@/lib/api/apiClient";
import { Lead } from "../../domain/entities/Lead";
import { ILeadRepository } from "../../domain/repositories/ILeadRepository";
import { LeadMapper } from "../mappers/LeadMapper";

export class LeadRepositoryApi implements ILeadRepository {
  async save(lead: Lead): Promise<Lead> {
    const persistence = LeadMapper.toPersistence(lead);

    const response = await apiClient.post<unknown>("/crm/leads", persistence);

    const savedData = Array.isArray(response) ? response[0] : response;
    if (!savedData) throw new Error("Nenhum dado retornado ao salvar lead");

    return LeadMapper.toDomain(savedData);
  }

  async findById(id: string): Promise<Lead | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`/crm/leads/${id}`);
      if (!data) return null;
      return LeadMapper.toDomain(
        data as Parameters<typeof LeadMapper.toDomain>[0],
      );
    } catch (error: unknown) {
      const _e = error as {
        response?: { status?: number; data?: { error?: string } };
        message?: string;
      };
      if (_e.response?.status === 404 || _e.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar lead: ${_e.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/crm/leads");
      return (
        data?.map((d) =>
          LeadMapper.toDomain(d as Parameters<typeof LeadMapper.toDomain>[0]),
        ) ?? []
      );
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar leads: ${_e.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/crm/leads", {
        params: { assigned_to: responsavelId },
      });
      return (
        data?.map((d) =>
          LeadMapper.toDomain(d as Parameters<typeof LeadMapper.toDomain>[0]),
        ) ?? []
      );
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar leads do responsável: ${_e.message}`);
    }
  }

  async findByStatus(clinicId: string, status: string): Promise<Lead[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/crm/leads", {
        params: { status },
      });
      return (
        data?.map((d) =>
          LeadMapper.toDomain(d as Parameters<typeof LeadMapper.toDomain>[0]),
        ) ?? []
      );
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar leads por status: ${_e.message}`);
    }
  }

  async update(lead: Lead): Promise<Lead> {
    const data = LeadMapper.toPersistence(lead);

    try {
      const response = await apiClient.patch<unknown>(
        `/crm/leads/${lead.id}`,
        data,
      );

      const updatedData = Array.isArray(response) ? response[0] : response;
      if (!updatedData)
        throw new Error("Nenhum dado retornado ao atualizar lead");

      return LeadMapper.toDomain(updatedData);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar lead: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/leads/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar lead: ${_e.message}`);
    }
  }
}
