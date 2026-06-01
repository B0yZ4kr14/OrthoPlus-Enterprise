import { Agendamento } from "@/domain/entities/Agendamento";
import { IAgendamentoRepository } from "@/domain/repositories/IAgendamentoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { AgendamentoMapper } from "./mappers/AgendamentoMapper";
import type { Tables } from "@/types/database";
import { logger } from "@/lib/logger";

export class DbAgendamentoRepository implements IAgendamentoRepository {
  async findById(id: string): Promise<Agendamento | null> {
    try {
      const data = await apiClient.get<Tables<"appointments">>(
        `/agenda/appointments/${id}`,
      );
      if (!data) return null;
      return AgendamentoMapper.toDomain(data);
    } catch (error) {
      console.error("[DbAgendamentoRepository.findById] failed:", error);
      return null;
    }
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(
        `/agenda/appointments`,
        {
          params: {
            dentist_id: dentistId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
      );
      return (data || []).map(AgendamentoMapper.toDomain);
    } catch (error) {
      console.error("[DbAgendamentoRepository.findByDentistAndDateRange] failed:", error);
      return [];
    }
  }

  async findByPatientId(
    patientId: string,
    clinicId: string,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(
        `/agenda/appointments`,
        {
          params: { patient_id: patientId, clinic_id: clinicId },
        },
      );
      return (data || []).map((d) => AgendamentoMapper.toDomain(d));
    } catch (error) {
      console.error("[DbAgendamentoRepository.findByPatientId] failed:", error);
      return [];
    }
  }

  async findByClinicAndDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(
        `/agenda/appointments`,
        {
          params: {
            clinic_id: clinicId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
      );
      return (data || []).map((d) => AgendamentoMapper.toDomain(d));
    } catch (error) {
      console.error("[DbAgendamentoRepository.findByClinicAndDateRange] failed:", error);
      return [];
    }
  }

  async findByStatus(
    clinicId: string,
    status:
      | "AGENDADO"
      | "CONFIRMADO"
      | "EM_ATENDIMENTO"
      | "CONCLUIDO"
      | "CANCELADO"
      | "FALTOU",
  ): Promise<Agendamento[]> {
    const dbStatus = status.toLowerCase();
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(
        `/agenda/appointments`,
        {
          params: { clinic_id: clinicId, status: dbStatus },
        },
      );
      return (data || []).map((d) => AgendamentoMapper.toDomain(d));
    } catch (error) {
      console.error("[DbAgendamentoRepository.findByStatus] failed:", error);
      return [];
    }
  }

  async findAtivos(clinicId: string): Promise<Agendamento[]> {
    try {
      const data = await apiClient.get<Tables<"appointments">[]>(
        `/agenda/appointments`,
        {
          params: {
            clinic_id: clinicId,
            status: "not.in.(cancelado,concluido,faltou)",
          },
        },
      );
      return (data || []).map((d) => AgendamentoMapper.toDomain(d));
    } catch (error) {
      console.error("[DbAgendamentoRepository.findAtivos] failed:", error);
      return [];
    }
  }

  async hasConflict(
    dentistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      const params: Record<string, string> = {
        dentist_id: dentistId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      };
      if (excludeId) params.exclude_id = excludeId;

      const data = await apiClient.get<{ hasConflict: boolean }>(
        `/agenda/appointments/conflict`,
        { params },
      );
      return data?.hasConflict ?? false;
    } catch (error) {
      logger.error("Erro ao verificar conflito", error);
      return false;
    }
  }

  async save(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.post("/agenda/appointments", dbData);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao salvar agendamento: ${_e.message}`);
    }
  }

  async update(agendamento: Agendamento): Promise<void> {
    const dbData = AgendamentoMapper.toDatabase(agendamento);
    try {
      await apiClient.patch(`/agenda/appointments/${agendamento.id}`, dbData);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar agendamento: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/agenda/appointments/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar agendamento: ${_e.message}`);
    }
  }
}
