import { AppointmentReminder } from "../entities/AppointmentReminder";

export interface IAppointmentReminderRepository {
  findById(id: string): Promise<AppointmentReminder | null>;
  findByAppointmentId(appointmentId: string): Promise<AppointmentReminder[]>;
  findPendentes(): Promise<AppointmentReminder[]>;
  findEnviadasNaoConfirmadas(): Promise<AppointmentReminder[]>;
  save(reminder: AppointmentReminder): Promise<void>;
  update(reminder: AppointmentReminder): Promise<void>;
  delete(id: string): Promise<void>;
}
