/**
 * PacienteSearchService — Serviço de busca avançada de pacientes
 *
 * Implementa busca full-text por nome, CPF, telefone ou email
 * com filtros por status, dentista responsável e ordenação.
 */

import { prisma } from "@/infrastructure/database/prismaClient"
import { logger } from "@/infrastructure/logger"

export interface SearchPacientesFilters {
  query?: string
  status?: string
  dentistaId?: string
  page?: number
  limit?: number
  orderBy?: "relevance" | "recent" | "name"
}

export interface SearchPacientesResult {
  patients: Array<{
    id: string
    fullName: string
    cpf: string | null
    phone: string | null
    email: string | null
    status: string
    birthDate: string | null
    photoUrl: string | null
    lastVisit: string | null
  }>
  total: number
  page: number
  limit: number
}

export class PacienteSearchService {
  async search(
    clinicId: string,
    filters: SearchPacientesFilters,
  ): Promise<SearchPacientesResult> {
    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.min(50, Math.max(1, filters.limit ?? 20))
    const skip = (page - 1) * limit

    logger.info("PacienteSearchService: searching", {
      clinicId,
      query: filters.query,
      status: filters.status,
    })

    const where: Record<string, unknown> = {
      clinic_id: clinicId,
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.dentistaId) {
      where.dentista_responsavel_id = filters.dentistaId
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim()
      where.OR = [
        { full_name: { contains: q, mode: "insensitive" } },
        { cpf: { contains: q.replace(/\D/g, ""), mode: "insensitive" } },
        { phone_primary: { contains: q.replace(/\D/g, ""), mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]
    }

    const orderBy = this.buildOrderBy(filters.orderBy ?? "relevance", filters.query)

    const [patients, total] = await Promise.all([
      prisma.patients.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          full_name: true,
          cpf: true,
          phone_primary: true,
          email: true,
          status: true,
          birth_date: true,
          photo_url: true,
          last_appointment_date: true,
        },
      }),
      prisma.patients.count({ where }),
    ])

    logger.info("PacienteSearchService: found", {
      clinicId,
      total,
      returned: patients.length,
    })

    return {
      patients: patients.map((p) => ({
        id: p.id,
        fullName: p.full_name,
        cpf: p.cpf,
        phone: p.phone_primary,
        email: p.email,
        status: p.status ?? "",
        birthDate: p.birth_date,
        photoUrl: p.photo_url,
        lastVisit: p.last_appointment_date,
      })),
      total,
      page,
      limit,
    }
  }

  private buildOrderBy(
    orderBy: "relevance" | "recent" | "name",
    query?: string,
  ): Array<Record<string, string>> {
    switch (orderBy) {
      case "recent":
        return [{ updated_at: "desc" }]
      case "name":
        return [{ full_name: "asc" }]
      case "relevance":
      default:
        if (query && query.trim().length > 0) {
          return [
            { full_name: "asc" },
            { updated_at: "desc" },
          ]
        }
        return [{ updated_at: "desc" }]
    }
  }
}
