import { MovimentoCaixa } from "@/domain/entities/MovimentoCaixa";
import { IMovimentoCaixaRepository } from "@/domain/repositories/IMovimentoCaixaRepository";
import { apiClient } from "@/lib/api/apiClient";
import { MovimentoCaixaMapper } from "./mappers/MovimentoCaixaMapper";
import type { Tables } from "@/types/database";

export class DbMovimentoCaixaRepository implements IMovimentoCaixaRepository {
  async findById(id: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">>(
        `/financeiro/movimentos/${id}`,
      );
      if (!data) return null;
      return MovimentoCaixaMapper.toDomain(data);
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findById] failed:", error);
      return null;
    }
  }

  async findByClinicId(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>(
        "/financeiro/movimentos",
        {
          params: { clinic_id: clinicId },
        },
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findByClinicId] failed:", error);
      return [];
    }
  }

  async findAbertos(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>(
        "/financeiro/movimentos",
        {
          params: { clinic_id: clinicId, status: "ABERTO" },
        },
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findAbertos] failed:", error);
      return [];
    }
  }

  async findUltimoAberto(clinicId: string): Promise<MovimentoCaixa | null> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>(
        "/financeiro/movimentos",
        {
          params: { clinic_id: clinicId, status: "ABERTO" },
        },
      );
      if (!data || data.length === 0) return null;
      return MovimentoCaixaMapper.toDomain(data[0]);
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findUltimoAberto] failed:", error);
      return null;
    }
  }

  async findByPeriodo(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>(
        "/financeiro/movimentos",
        {
          params: {
            clinic_id: clinicId,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        },
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findByPeriodo] failed:", error);
      return [];
    }
  }

  async findSangrias(clinicId: string): Promise<MovimentoCaixa[]> {
    try {
      const data = await apiClient.get<Tables<"caixa_movimentos">[]>(
        "/financeiro/movimentos",
        {
          params: { clinic_id: clinicId, tipo: "SANGRIA" },
        },
      );
      return (data || []).map((row) => MovimentoCaixaMapper.toDomain(row));
    } catch (error) {
      console.error("[DbMovimentoCaixaRepository.findSangrias] failed:", error);
      return [];
    }
  }

  async save(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toDbInsert(movimento);
    try {
      await apiClient.post("/financeiro/movimentos", insert);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao salvar movimento de caixa: ${_e.message}`);
    }
  }

  async update(movimento: MovimentoCaixa): Promise<void> {
    const insert = MovimentoCaixaMapper.toDbInsert(movimento);
    try {
      await apiClient.patch(`/financeiro/movimentos/${movimento.id}`, insert);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao atualizar movimento de caixa: ${_e.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/movimentos/${id}`);
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao deletar movimento de caixa: ${_e.message}`);
    }
  }
}
