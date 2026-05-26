import { apiClient } from "@/lib/api/apiClient";
import { DentistSchedule } from "../../domain/entities/DentistSchedule";
import { IDentistScheduleRepository } from "../../domain/repositories/IDentistScheduleRepository";
import { DentistScheduleMapper } from "../mappers/DentistScheduleMapper";

export class DentistScheduleRepositoryApi implements IDentistScheduleRepository {
  private readonly basePath = "/agenda/schedules";

  async save(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toPersistence(schedule);
    const result = await apiClient.post<unknown>(this.basePath, data);
    return DentistScheduleMapper.toDomain(result as Parameters<typeof DentistScheduleMapper.toDomain>[0]);
  }

  async findById(id: string): Promise<DentistSchedule | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`${this.basePath}/${id}`);
      // @ts-expect-error — TS2345
      return data ? DentistScheduleMapper.toDomain(data) : null;
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      const err = error as { response?: { status?: number } };
      if (err?.response?.status == 404 || err?.response?.status == 400)
        return null;
      throw new Error(`Erro ao buscar horário: ${_e.message}`);
    }
  }

  async findByDentist(dentistId: string): Promise<DentistSchedule[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: { dentist_id: dentistId, is_active: true },
    });
    return data.map((d) => DentistScheduleMapper.toDomain(d as Parameters<typeof DentistScheduleMapper.toDomain>[0]));
  }

  async findByDentistAndDayOfWeek(
    dentistId: string,
    dayOfWeek: number,
  ): Promise<DentistSchedule | null> {
    try {
      const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
        params: {
          dentist_id: dentistId,
          day_of_week: dayOfWeek,
          is_active: true,
        },
      });
      // @ts-expect-error — TS2345
      if (data.length > 0) return DentistScheduleMapper.toDomain(data[0]);
      return null;
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      throw new Error(`Erro ao buscar horário: ${_e.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<DentistSchedule[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: { clinic_id: clinicId, is_active: true },
    });
    return data.map((d) => DentistScheduleMapper.toDomain(d as Parameters<typeof DentistScheduleMapper.toDomain>[0]));
  }

  async update(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toUpdate(schedule);
    const result = await apiClient.patch<unknown>(
      `${this.basePath}/${schedule.id}`,
      data,
    );
    return DentistScheduleMapper.toDomain(result as Parameters<typeof DentistScheduleMapper.toDomain>[0]);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
