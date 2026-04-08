import { apiClient } from "@/lib/api/apiClient";
import { Appointment } from "../../domain/entities/Appointment";
import { IAppointmentRepository } from "../../domain/repositories/IAppointmentRepository";
import { AppointmentMapper } from "../mappers/AppointmentMapper";

export class AppointmentRepositoryApi implements IAppointmentRepository {
  async save(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const result = await apiClient.post<unknown>("/agenda/appointments", data);
    // @ts-expect-error — TS2345
    return AppointmentMapper.toDomain(result);
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const data = await apiClient.get<Record<string, any>>(`/agenda/appointments/${id}`);
      // @ts-expect-error — TS2345
      return data ? AppointmentMapper.toDomain(data) : null;
    } catch (error: unknown) {
      const _e = error instanceof Error ? error : { message: String(error) };
      // @ts-expect-error — TS2339
      if ((error as { response?: { status?: number } })?.response?.status === 404 || error?.response?.status === 400)
        return null;
      throw new Error(`Erro ao buscar agendamento: ${_e.message}`);
    }
  }

  async findByClinicId(clinicId: string): Promise<Appointment[]> {
    const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
      params: { clinic_id: clinicId },
    });
    // @ts-expect-error — TS2345
    return data.map(AppointmentMapper.toDomain);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
      params: { patient_id: patientId },
    });
    // @ts-expect-error — TS2345
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentist(dentistId: string): Promise<Appointment[]> {
    const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
      params: { dentist_id: dentistId },
    });
    // @ts-expect-error — TS2345
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
      params: {
        clinic_id: clinicId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    // @ts-expect-error — TS2345
    return data.map(AppointmentMapper.toDomain);
  }

  async findByDentistAndDateRange(
    dentistId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
      params: {
        dentist_id: dentistId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      },
    });
    // @ts-expect-error — TS2345
    return data.map(AppointmentMapper.toDomain);
  }

  async findConflicts(
    dentistId: string,
    startDatetime: Date,
    endDatetime: Date,
    excludeId?: string,
  ): Promise<Appointment[]> {
    const params: Record<string, any> = {
      dentist_id: dentistId,
      start_time: startDatetime.toISOString(),
      end_time: endDatetime.toISOString(),
    };
    if (excludeId) params.exclude_id = excludeId;

    // Use the conflict endpoint which returns { hasConflict, count }
    // For backward compat, we return empty array if no conflicts
    const result = await apiClient.get<{ hasConflict: boolean }>(
      `/agenda/appointments/conflict`,
      { params },
    );

    // If there are conflicts, fetch the conflicting appointments
    if (result?.hasConflict) {
      const data = await apiClient.get<Record<string, any>[]>(`/agenda/appointments`, {
        params: {
          dentist_id: dentistId,
          start_date: startDatetime.toISOString(),
          end_date: endDatetime.toISOString(),
        },
      });
      return data
        .filter((a) => a.id !== excludeId)
        // @ts-expect-error — TS2345
        .map(AppointmentMapper.toDomain);
    }
    return [];
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toUpdate(appointment);
    const result = await apiClient.patch<unknown>(
      `/agenda/appointments/${appointment.id}`,
      data,
    );
    // @ts-expect-error — TS2345
    return AppointmentMapper.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/agenda/appointments/${id}`);
  }
}
