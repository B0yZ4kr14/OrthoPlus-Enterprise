import { apiClient } from "@/lib/api/apiClient";
import { BlockedTime } from "../../domain/entities/BlockedTime";
import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";
import { BlockedTimeMapper } from "../mappers/BlockedTimeMapper";

export class BlockedTimeRepositoryApi implements IBlockedTimeRepository {
  private readonly basePath = "/agenda/blocked-times";

  async save(blockedTime: BlockedTime): Promise<BlockedTime> {
    const data = BlockedTimeMapper.toPersistence(blockedTime);
    const result = await apiClient.post<unknown>(this.basePath, data);
    // @ts-expect-error — TS2345
    return BlockedTimeMapper.toDomain(result);
  }

  async findById(id: string): Promise<BlockedTime | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`${this.basePath}/${id}`);
      // @ts-expect-error — TS2345
      return data ? BlockedTimeMapper.toDomain(data) : null;
    } catch (error: unknown) {
      const axiosErr = error as { response?: { status?: number } };
      if (axiosErr.response?.status === 404 || axiosErr.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar bloqueio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findByDentist(dentistId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: {
        dentist_id: dentistId,
        active: true,
      },
    });
    // @ts-expect-error — TS2345
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BlockedTime[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: {
        dentist_id: dentistId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    // @ts-expect-error — TS2345
    return data.map(BlockedTimeMapper.toDomain);
  }

  async findByClinicId(clinicId: string): Promise<BlockedTime[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: {
        clinic_id: clinicId,
        active: true,
      },
    });
    // @ts-expect-error — TS2345
    return data.map(BlockedTimeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
