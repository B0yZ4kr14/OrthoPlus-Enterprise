import { IPatientRepository, FindAllOptions, PatientFilters, PaginationOptions, PaginatedResult, PatientStats } from '../../domain/repositories/IPatientRepository';
import { Patient } from '../../domain/entities/Patient';
import { PatientStatus } from '../../domain/value-objects/PatientStatus';
import { prisma } from '@/infrastructure/database/prismaClient';

export class PatientRepositoryPostgres implements IPatientRepository {
  async findById(id: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.$queryRaw<any[]>`SELECT * FROM pacientes.patients WHERE id = ${id} AND clinic_id = ${clinicId} LIMIT 1`;
    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.$queryRaw<any[]>`SELECT * FROM pacientes.patients WHERE cpf = ${cpf} AND clinic_id = ${clinicId} LIMIT 1`;
    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findByEmail(email: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.$queryRaw<any[]>`SELECT * FROM pacientes.patients WHERE email = ${email} AND clinic_id = ${clinicId} LIMIT 1`;
    return result[0] ? this.mapToEntity(result[0]) : null;
  }

  async findAll(options: FindAllOptions): Promise<{ items: Patient[]; total: number }> {
    const skip = options.skip ?? 0;
    const take = options.take ?? 50;
    const searchPattern = options.searchTerm ? `%${options.searchTerm}%` : null;
    const rows = await prisma.$queryRaw<any[]>` // eslint-disable-line @typescript-eslint/no-explicit-any
      SELECT * FROM pacientes.patients
      WHERE clinic_id = ${options.clinicId}
        AND (${options.status ?? null}::text IS NULL OR status_code = ${options.status ?? null})
        AND (${searchPattern}::text IS NULL OR full_name ILIKE ${searchPattern})
      ORDER BY created_at DESC
      LIMIT ${take} OFFSET ${skip}
    `;
    const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM pacientes.patients
      WHERE clinic_id = ${options.clinicId}
        AND (${options.status ?? null}::text IS NULL OR status_code = ${options.status ?? null})
        AND (${searchPattern}::text IS NULL OR full_name ILIKE ${searchPattern})
    `;
    return {
      items: rows.map(r => this.mapToEntity(r)),
      total: Number(countRows[0]?.count ?? 0),
    };
  }

  async findMany(filters: PatientFilters, pagination: PaginationOptions): Promise<PaginatedResult<Patient>> {
    const skip = (pagination.page - 1) * pagination.limit;
    const searchPattern = filters.searchTerm ? `%${filters.searchTerm}%` : null;
    const rows = await prisma.$queryRaw<any[]>` // eslint-disable-line @typescript-eslint/no-explicit-any
      SELECT * FROM pacientes.patients
      WHERE clinic_id = ${filters.clinicId}
        AND (${filters.statusCode ?? null}::text IS NULL OR status_code = ${filters.statusCode ?? null})
        AND (${searchPattern}::text IS NULL OR full_name ILIKE ${searchPattern})
        AND (${filters.isActive ?? null}::boolean IS NULL OR is_active = ${filters.isActive ?? null})
      ORDER BY created_at DESC
      LIMIT ${pagination.limit} OFFSET ${skip}
    `;
    const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM pacientes.patients
      WHERE clinic_id = ${filters.clinicId}
        AND (${filters.statusCode ?? null}::text IS NULL OR status_code = ${filters.statusCode ?? null})
        AND (${searchPattern}::text IS NULL OR full_name ILIKE ${searchPattern})
        AND (${filters.isActive ?? null}::boolean IS NULL OR is_active = ${filters.isActive ?? null})
    `;
    const total = Number(countRows[0]?.count ?? 0);
    return {
      data: rows.map(r => this.mapToEntity(r)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async countByStatus(clinicId: string): Promise<Record<string, number>> {
    const rows = await prisma.$queryRaw<{ status_code: string; count: bigint }[]>`
      SELECT status_code, COUNT(*) as count FROM pacientes.patients
      WHERE clinic_id = ${clinicId}
      GROUP BY status_code
    `;
    return Object.fromEntries(rows.map(r => [r.status_code, Number(r.count)]));
  }

  async getStats(clinicId: string): Promise<PatientStats> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const total = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pacientes.patients WHERE clinic_id = ${clinicId}`;
    const ativos = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pacientes.patients WHERE clinic_id = ${clinicId} AND is_active = true`;
    const inativos = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pacientes.patients WHERE clinic_id = ${clinicId} AND is_active = false`;
    const novos = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pacientes.patients WHERE clinic_id = ${clinicId} AND created_at >= ${firstDay}::timestamptz`;
    return {
      total: Number(total[0]?.count ?? 0),
      ativos: Number(ativos[0]?.count ?? 0),
      inativos: Number(inativos[0]?.count ?? 0),
      arquivados: 0,
      novosEsteMes: Number(novos[0]?.count ?? 0),
    };
  }

  async saveStatusHistory(patientId: string, fromStatus: string | null, toStatus: string, reason: string, changedBy: string, metadata?: Record<string, unknown>): Promise<void> {
    const metadataJson = JSON.stringify(metadata ?? {});
    await prisma.$executeRaw`
      INSERT INTO pacientes.patient_status_history (patient_id, from_status, to_status, reason, changed_by, metadata, changed_at)
      VALUES (${patientId}, ${fromStatus}, ${toStatus}, ${reason}, ${changedBy}, ${metadataJson}::jsonb, NOW())
    `;
  }

  async getStatusHistory(patientId: string): Promise<unknown[]> {
    return prisma.$queryRaw<unknown[]>`SELECT * FROM pacientes.patient_status_history WHERE patient_id = ${patientId} ORDER BY changed_at DESC`;
  }

  async exists(id: string, clinicId: string): Promise<boolean> {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pacientes.patients WHERE id = ${id} AND clinic_id = ${clinicId}`;
    return Number(rows[0]?.count ?? 0) > 0;
  }

  async save(patient: Patient): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO pacientes.patients (id, clinic_id, full_name, cpf, email, status_code, is_active, created_at, updated_at)
      VALUES (${patient.id}, ${patient.clinicId}, ${patient.fullName}, ${patient.cpf ?? null}, ${patient.email ?? null}, ${patient.statusCode}, ${patient.isActive}, ${patient.createdAt}, ${patient.updatedAt})
    `;
  }

  async update(patient: Patient): Promise<void> {
    await prisma.$executeRaw`
      UPDATE pacientes.patients
      SET full_name = ${patient.fullName}, cpf = ${patient.cpf ?? null}, email = ${patient.email ?? null}, status_code = ${patient.statusCode}, is_active = ${patient.isActive}, updated_at = ${patient.updatedAt}
      WHERE id = ${patient.id} AND clinic_id = ${patient.clinicId}
    `;
  }

  async delete(id: string, clinicId: string): Promise<void> {
    await prisma.$executeRaw`UPDATE pacientes.patients SET is_active = false, updated_at = NOW() WHERE id = ${id} AND clinic_id = ${clinicId}`;
  }

  private mapToEntity(row: Record<string, unknown>): Patient {
    return Patient.reconstitute({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      fullName: row.full_name as string,
      cpf: row.cpf as string | undefined,
      email: row.email as string | undefined,
      status: PatientStatus.fromCode((row.status_code as string) ?? 'PROSPECT'),
      isActive: (row.is_active as boolean) ?? true,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    });
  }
}
