import { apiClient } from "@/lib/api/apiClient";
import { Atividade } from "../../domain/entities/Atividade";
import { IAtividadeRepository } from "../../domain/repositories/IAtividadeRepository";
import { AtividadeMapper } from "../mappers/AtividadeMapper";

export class AtividadeRepositoryApi implements IAtividadeRepository {
  async save(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);

    try {
      const response = await apiClient.post<unknown>("/crm/atividades", data);

      const savedData = Array.isArray(response) ? response[0] : response;
      if (!savedData)
        throw new Error("Nenhum dado retornado ao salvar atividade");

      return AtividadeMapper.toDomain(savedData);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao salvar atividade: ${_e.message}`);
    }
  }

  async findById(id: string): Promise<Atividade | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`/crm/atividades/${id}`);
      if (!data) return null;
      return AtividadeMapper.toDomain(data as Parameters<typeof AtividadeMapper.toDomain>[0]);
    } catch (error: unknown) {
      const _e = error as { response?: { status?: number; data?: { error?: string } }; message?: string };
      if (_e.response?.status === 404 || _e.response?.status === 406)
        return null;
      throw new Error(`Erro ao buscar atividade: ${_e.message}`);
    }
  }

  async findByLeadId(leadId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/crm/atividades", {
        params: { lead_id: leadId },
      });
      return data?.map((d) => AtividadeMapper.toDomain(d as Parameters<typeof AtividadeMapper.toDomain>[0])) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar atividades do lead: ${_e.message}`);
    }
  }

  async findByResponsavel(responsavelId: string): Promise<Atividade[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/crm/atividades", {
        params: { assigned_to: responsavelId },
      });
      return data?.map((d) => AtividadeMapper.toDomain(d as Parameters<typeof AtividadeMapper.toDomain>[0])) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(
        `Erro ao buscar atividades do responsável: ${_e.message}`,
      );
    }
  }

  async findAgendadasPorData(
    clinicId: string,
    data: Date,
  ): Promise<Atividade[]> {
    const startOfDay = new Date(data);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(data);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const activities = await apiClient.get<Record<string, any>[]>("/crm/atividades", {
        params: {
          status: "AGENDADA",
          start_date: startOfDay.toISOString(),
          end_date: endOfDay.toISOString(),
        },
      });
      // @ts-expect-error — TS2345
      return activities?.map(AtividadeMapper.toDomain) ?? [];
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar atividades agendadas: ${_e.message}`);
    }
  }

  async update(atividade: Atividade): Promise<Atividade> {
    const data = AtividadeMapper.toPersistence(atividade);

    try {
      const response = await apiClient.patch<unknown>(
        `/crm/atividades/${atividade.id}`,
        data,
      );

      const updatedData = Array.isArray(response) ? response[0] : response;
      if (!updatedData)
        throw new Error("Nenhum dado retornado ao atualizar atividade");

      return AtividadeMapper.toDomain(updatedData);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar atividade: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/crm/atividades/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar atividade: ${_e.message}`);
    }
  }
}
