import { apiClient } from "@/lib/api/apiClient";
import { DentistSchedule } from "../../domain/entities/DentistSchedule";
import { IDentistScheduleRepository } from "../../domain/repositories/IDentistScheduleRepository";
import { DentistScheduleMapper } from "../mappers/DentistScheduleMapper";

export class DentistScheduleRepositoryApi implements IDentistScheduleRepository {
  private readonly basePath = "/agenda/schedules";

  async save(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toPersistence(schedule);
    const result = await apiClient.post<unknown>(this.basePath, data);
    // @ts-expect-error — TS2345
    return DentistScheduleMapper.toDomain(result);
  }

  async findById(id: string): Promise<DentistSchedule | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`${this.basePath}/${id}`);
      // @ts-expect-error — TS2345
      return data ? DentistScheduleMapper.toDomain(data) : null;
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // @ts-expect-error — TS2339
      if ((error as { response?: { status?: number } })?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar horário: ${_e.message}`);
    }
  }

  async findByDentist(dentistId: string): Promise<DentistSchedule[]> {
    const data = await apiClient.get<Record<string, any>[]>(this.basePath, {
      params: { dentist_id: dentistId, is_active: true },
    });
    // @ts-expect-error — TS2345
    return data.map(DentistScheduleMapper.toDomain);
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
    // @ts-expect-error — TS2345
    return data.map(DentistScheduleMapper.toDomain);
  }

  async update(schedule: DentistSchedule): Promise<DentistSchedule> {
    const data = DentistScheduleMapper.toUpdate(schedule);
    const result = await apiClient.patch<unknown>(
      `${this.basePath}/${schedule.id}`,
      data,
    );
    // @ts-expect-error — TS2345
    return DentistScheduleMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }
}
