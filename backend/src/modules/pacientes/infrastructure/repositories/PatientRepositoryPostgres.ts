import {
  IPatientRepository,
  FindAllOptions,
  PatientFilters,
  PaginationOptions,
  PaginatedResult,
  PatientStats,
} from "../../domain/repositories/IPatientRepository";
import { Patient } from "../../domain/entities/Patient";
import { PatientStatus } from "../../domain/value-objects/PatientStatus";
import { prisma } from "@/infrastructure/database/prismaClient";

export class PatientRepositoryPostgres implements IPatientRepository {
  async findById(id: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.patients.findFirst({
      where: { id, clinic_id: clinicId },
    });
    return result ? this.mapToEntity(result) : null;
  }

  async findByCPF(cpf: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.patients.findFirst({
      where: { cpf, clinic_id: clinicId },
    });
    return result ? this.mapToEntity(result) : null;
  }

  async findByEmail(email: string, clinicId: string): Promise<Patient | null> {
    const result = await prisma.patients.findFirst({
      where: { email, clinic_id: clinicId },
    });
    return result ? this.mapToEntity(result) : null;
  }

  async findAll(
    options: FindAllOptions,
  ): Promise<{ items: Patient[]; total: number }> {
    const skip = options.skip ?? 0;
    const take = options.take ?? 50;

    const whereClause: Record<string, unknown> = {
      clinic_id: options.clinicId,
    };

    if (options.status) {
      whereClause.status = options.status;
    }

    if (options.searchTerm) {
      whereClause.full_name = {
        contains: options.searchTerm,
        mode: "insensitive",
      };
    }

    const [rows, countResult] = await Promise.all([
      prisma.patients.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take,
      }),
      prisma.patients.count({ where: whereClause }),
    ]);

    return {
      items: rows.map((r) => this.mapToEntity(r)),
      total: countResult,
    };
  }

  async findMany(
    filters: PatientFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Patient>> {
    const skip = (pagination.page - 1) * pagination.limit;

    const whereClause: Record<string, unknown> = {
      clinic_id: filters.clinicId,
    };

    if (filters.statusCode) {
      whereClause.status = filters.statusCode;
    }

    if (filters.searchTerm) {
      whereClause.full_name = {
        contains: filters.searchTerm,
        mode: "insensitive",
      };
    }

    // is_active não existe no schema - filtrar por status se necessário
    if (filters.isActive !== undefined && filters.isActive !== null) {
      const activeStatuses = ["TRATAMENTO", "CONTENCAO", "ERUPCAO", "PROSPECT"];
      const inactiveStatuses = [
        "INATIVO",
        "ABANDONO",
        "CANCELADO",
        "CONCLUIDO",
      ];
      whereClause.status = filters.isActive
        ? { in: activeStatuses }
        : { in: inactiveStatuses };
    }

    const [rows, total] = await Promise.all([
      prisma.patients.findMany({
        where: whereClause,
        orderBy: { created_at: "desc" },
        skip,
        take: pagination.limit,
      }),
      prisma.patients.count({ where: whereClause }),
    ]);

    return {
      data: rows.map((r) => this.mapToEntity(r)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async countByStatus(clinicId: string): Promise<Record<string, number>> {
    const rows = await prisma.patients.groupBy({
      by: ["status"],
      where: { clinic_id: clinicId },
      _count: { status: true },
    });
    return Object.fromEntries(rows.map((r) => [r.status, r._count.status]));
  }

  async getStats(clinicId: string): Promise<PatientStats> {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeStatuses = ["TRATAMENTO", "CONTENCAO", "ERUPCAO", "PROSPECT"];
    const inactiveStatuses = ["INATIVO", "ABANDONO", "CANCELADO", "CONCLUIDO"];

    const [total, ativos, inativos, novos] = await Promise.all([
      prisma.patients.count({ where: { clinic_id: clinicId } }),
      prisma.patients.count({
        where: { clinic_id: clinicId, status: { in: activeStatuses } },
      }),
      prisma.patients.count({
        where: { clinic_id: clinicId, status: { in: inactiveStatuses } },
      }),
      prisma.patients.count({
        where: {
          clinic_id: clinicId,
          created_at: { gte: firstDay },
        },
      }),
    ]);

    return {
      total,
      ativos,
      inativos,
      arquivados: 0,
      novosEsteMes: novos,
    };
  }

  async saveStatusHistory(
    patientId: string,
    fromStatus: string | null,
    toStatus: string,
    reason: string,
    changedBy: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await prisma.patient_status_history.create({
      data: {
        patient_id: patientId,
        from_status: fromStatus,
        to_status: toStatus,
        reason,
        changed_by: changedBy,
        notes: metadata ? JSON.stringify(metadata) : null,
        changed_at: new Date().toISOString(),
      },
    });
  }

  async getStatusHistory(patientId: string): Promise<unknown[]> {
    return prisma.patient_status_history.findMany({
      where: { patient_id: patientId },
      orderBy: { changed_at: "desc" },
    });
  }

  async exists(id: string, clinicId: string): Promise<boolean> {
    const count = await prisma.patients.count({
      where: { id, clinic_id: clinicId },
    });
    return count > 0;
  }

  async save(patient: Patient): Promise<void> {
    await prisma.patients.create({
      data: patient.toPersistence() as unknown as Parameters<
        typeof prisma.patients.create
      >[0]["data"],
    });
  }

  async update(patient: Patient): Promise<void> {
    await prisma.patients.updateMany({
      where: { id: patient.id, clinic_id: patient.clinicId },
      data: patient.toPersistence() as unknown as Parameters<
        typeof prisma.patients.updateMany
      >[0]["data"],
    });
  }

  async delete(id: string, clinicId: string): Promise<void> {
    await prisma.patients.updateMany({
      where: { id, clinic_id: clinicId },
      data: { status: "INATIVO", updated_at: new Date() },
    });
  }

  private mapToEntity(row: Record<string, unknown>): Patient {
    const statusCode = (row.status as string) ?? "PROSPECT";
    const activeStatuses = ["TRATAMENTO", "CONTENCAO", "ERUPCAO", "PROSPECT"];
    return Patient.reconstitute({
      id: row.id as string,
      clinicId: row.clinic_id as string,
      fullName: row.full_name as string,
      cpf: row.cpf as string | undefined,
      rg: row.rg as string | undefined,
      birthDate: row.birth_date
        ? new Date(row.birth_date as string)
        : undefined,
      gender: row.gender as string | undefined,
      email: row.email as string | undefined,
      phone: row.phone_primary as string | undefined,
      mobile: row.phone_secondary as string | undefined,
      addressStreet: row.address_street as string | undefined,
      addressNumber: row.address_number as string | undefined,
      addressComplement: row.address_complement as string | undefined,
      addressNeighborhood: row.address_neighborhood as string | undefined,
      addressCity: row.address_city as string | undefined,
      addressState: row.address_state as string | undefined,
      addressZipcode: row.address_zipcode as string | undefined,
      photoUrl: row.photo_url as string | undefined,
      notes: row.clinical_observations as string | undefined,
      status: PatientStatus.fromCode(statusCode),
      isActive: activeStatuses.includes(statusCode),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
      createdBy: row.created_by as string | undefined,
      updatedBy: row.updated_by as string | undefined,
    });
  }

  // ─── Related entities (used by PacientesController) ───

  async findAppointmentsByPatient(patientId: string) {
    return prisma.appointments.findMany({
      where: { patient_id: patientId },
      orderBy: { start_time: "desc" },
    });
  }

  async findTratamentosByPatient(patientId: string) {
    // pep_tratamentos não tem patient_id direto — usa prontuario_id
    // Esta query pode precisar de ajuste conforme schema real
    return prisma.pep_tratamentos.findMany({
      where: { prontuario_id: patientId },
      orderBy: { created_at: "desc" },
    });
  }

  async findBudgetsByPatient(patientId: string) {
    return prisma.budgets.findMany({
      where: { patient_id: patientId },
      orderBy: { created_at: "desc" },
    });
  }

  async findStatusHistoryByPatient(patientId: string) {
    return prisma.patient_status_history.findMany({
      where: { patient_id: patientId },
      orderBy: { created_at: "desc" },
    });
  }

  async findPatientAccount(patientId: string) {
    return prisma.patient_accounts.findFirst({
      where: { patient_id: patientId },
    });
  }

  async findPatientAccountByEmail(email: string) {
    return prisma.patient_accounts.findFirst({
      where: { email },
    });
  }

  async deletePatientSessionsBySessionId(sessionId: string) {
    return prisma.patient_sessions.deleteMany({
      where: { id: sessionId },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPatientSession(data: Record<string, unknown>) {
    return prisma.patient_sessions.create({ data: data as any });
  }

  async deletePatientSessionsByPatient(patientId: string) {
    return prisma.patient_sessions.deleteMany({
      where: { patient_id: patientId },
    });
  }

  async findPatientById(id: string) {
    return prisma.patients.findFirst({ where: { id } });
  }

  async deletePatientHard(id: string) {
    return prisma.patients.deleteMany({ where: { id } });
  }
}
