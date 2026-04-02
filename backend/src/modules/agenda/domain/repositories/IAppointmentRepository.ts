import { Appointment } from '../entities/Appointment';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findAll(options: any): Promise<{ items: Appointment[]; total: number }>; // eslint-disable-line @typescript-eslint/no-explicit-any
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
  hasTimeConflict(dentistId: string, startTime: Date, endTime: Date, clinicId: string): Promise<boolean>;
}
