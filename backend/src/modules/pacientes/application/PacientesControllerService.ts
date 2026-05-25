import { logger } from "@/infrastructure/logger"
import { Errors } from "@/middleware/errorHandler"
import bcrypt from "bcrypt"
import type { IPatientRepository } from "../domain/repositories/IPatientRepository"
import { PacienteSearchService, SearchPacientesFilters } from "./services/PacienteSearchService"

export interface TimelineItem {
  id: string
  type: string
  title: string
  description: string
  date: string | null
  icon: string
}

export interface PatientAuthResult {
  action: "login" | "logout" | "signup"
  patient?: { id: string; email: string }
  sessionId?: string
}

export class PacientesControllerService {
  constructor(private patientRepository: IPatientRepository) {}

  async buildTimeline(patientId: string, clinicId: string): Promise<TimelineItem[]> {
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found")
    }

    const [appointments, treatments, budgets, statusChanges] = await Promise.all([
      this.patientRepository.findAppointmentsByPatient(patientId),
      this.patientRepository.findTratamentosByPatient(patientId),
      this.patientRepository.findBudgetsByPatient(patientId),
      this.patientRepository.findStatusHistoryByPatient(patientId),
    ])

    const timeline: TimelineItem[] = [
      ...appointments.map((a: any) => ({
        id: a.id,
        type: "appointment",
        title: a.title,
        description: `Consulta - ${a.status}`,
        date: a.start_time,
        icon: "calendar",
      })),
      ...treatments.map((t: any) => ({
        id: t.id,
        type: "treatment",
        title: t.titulo,
        description: `Tratamento - ${t.status}`,
        date: t.data_inicio || t.created_at,
        icon: "activity",
      })),
      ...budgets.map((b: any) => ({
        id: b.id,
        type: "budget",
        title: b.titulo,
        description: `Orçamento - R$ ${b.valor_total}`,
        date: b.created_at,
        icon: "file-text",
      })),
      ...statusChanges.map((s: any) => ({
        id: s.id,
        type: "status_change",
        title: "Mudança de Status",
        description: `${s.from_status} -> ${s.to_status}`,
        date: s.changed_at,
        icon: "refresh-cw",
      })),
    ]

    return timeline.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
  }

  async patientAuth(
    action: string,
    email: string | undefined,
    password: string | undefined,
    sessionIdFromCookie: string | undefined,
  ): Promise<PatientAuthResult> {
    if (action === "login") {
      if (!email || !password) {
        throw Errors.validation("Email and password are required")
      }

      const account = await this.patientRepository.findPatientAccountByEmail(email)

      if (!account) {
        throw Errors.unauthorized("Email ou senha inválidos")
      }

      if (!account.senha_hash) {
        logger.warn("patient_accounts record missing senha_hash", { email })
        throw Errors.unauthorized("Email ou senha inválidos")
      }

      const isValid = await bcrypt.compare(password, account.senha_hash)
      if (!isValid) {
        throw Errors.unauthorized("Email ou senha inválidos")
      }

      const sessionId = crypto.randomUUID()
      await this.patientRepository.createPatientSession({
        id: sessionId,
        patient_id: account.patient_id,
        token: sessionId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      return {
        action: "login",
        patient: { id: account.patient_id, email: account.email },
        sessionId,
      }
    }

    if (action === "signup") {
      return { action: "signup" }
    }

    if (action === "logout") {
      if (sessionIdFromCookie) {
        await this.patientRepository.deletePatientSessionsBySessionId(sessionIdFromCookie)
      }
      return { action: "logout" }
    }

    throw Errors.validation("Ação inválida")
  }

  async search(clinicId: string | undefined, filters: SearchPacientesFilters) {
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found")
    }
    const searchService = new PacienteSearchService()
    return searchService.search(clinicId, filters)
  }

  async list(
    clinicId: string,
    filters: { statusCode?: string; searchTerm?: string; origemId?: string; promotorId?: string; campanhaId?: string; isActive?: boolean },
    pagination: { page: number; limit: number; sortBy?: string; sortOrder?: "asc" | "desc" },
  ) {
    const result = await this.patientRepository.findMany({ clinicId, ...filters }, pagination)

    return {
      ...result,
      data: result.data.map((patient: any) => ({
        id: patient.id,
        fullName: patient.fullName,
        cpf: patient.cpf,
        email: patient.email,
        status: patient.status,
        dadosComerciais: patient.dadosComerciais,
        isActive: patient.isActive,
        createdAt: patient.createdAt,
      })),
    }
  }
}
