import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { Appointment } from '../../domain/entities/Appointment';
import { prisma } from '@/infrastructure/database/prismaClient';

export class AppointmentRepositoryPostgres implements IAppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const result = await prisma.appointments.findUnique({ where: { id } });
    return result ? this.mapToEntity(result) : null;
  }

  async findAll(options: { clinicId: string; skip?: number; take?: number }): Promise<{ items: Appointment[]; total: number }> {
    const [rows, count] = await Promise.all([
      prisma.appointments.findMany({
        where: { clinic_id: options.clinicId },
        orderBy: { start_time: 'asc' },
        skip: options.skip ?? 0,
        take: options.take ?? 50,
      }),
      prisma.appointments.count({ where: { clinic_id: options.clinicId } }),
    ]);
    return { items: rows.map((r) => this.mapToEntity(r)), total: count };
  }

  async save(appointment: Appointment): Promise<void> {
    await prisma.appointments.create({
      data: {
        id: appointment.id,
        clinic_id: appointment.clinicId,
        patient_id: appointment.patientId,
        dentist_id: appointment.dentistId,
        start_time: appointment.startTime as unknown as string,
        end_time: appointment.endTime as unknown as string,
        status: appointment.status,
        title: appointment.type || appointment.status,
        description: appointment.notes,
        created_by: appointment.createdBy,
        created_at: appointment.createdAt,
        updated_at: appointment.updatedAt,
      },
    });
  }

  async update(appointment: Appointment): Promise<void> {
    await prisma.appointments.update({
      where: { id: appointment.id },
      data: {
        patient_id: appointment.patientId,
        dentist_id: appointment.dentistId,
        start_time: appointment.startTime as unknown as string,
        end_time: appointment.endTime as unknown as string,
        status: appointment.status,
        description: appointment.notes,
        updated_at: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.appointments.delete({ where: { id } });
  }

  async hasTimeConflict(dentistId: string, startTime: Date, endTime: Date, clinicId: string): Promise<boolean> {
    const count = await prisma.appointments.count({
      where: {
        dentist_id: dentistId,
        clinic_id: clinicId,
        start_time: { lte: endTime.toISOString() },
        end_time: { gte: startTime.toISOString() },
      },
    });
    return count > 0;
  }

  private mapToEntity(raw: any): Appointment {
    return Appointment.create({
      id: raw.id,
      clinicId: raw.clinic_id,
      patientId: raw.patient_id,
      dentistId: raw.dentist_id,
      startTime: raw.start_time,
      endTime: raw.end_time,
      status: raw.status,
      type: raw.title,
      notes: raw.notes,
      createdBy: raw.created_by,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    });
  }
}
