import { prisma } from "@/infrastructure/database/prismaClient"
import { Prisma } from "@prisma/client"
import { IUserRepository } from "@/modules/auth/domain/repositories/IUserRepository"

/**
 * UserRepository — encapsulates all database access for the auth module.
 * Replaces direct Prisma calls in AuthController.
 */

export class UserRepository implements IUserRepository {
  // ─── users ───

  async findUserByEmail(email: string) {
    return prisma.users.findUnique({ where: { email } })
  }

  async findUserById(id: string) {
    return prisma.users.findUnique({ where: { id } })
  }

  async createUser(data: Prisma.usersCreateInput) {
    return prisma.users.create({ data })
  }

  // ─── patients ───

  async findPatientByCpf(cpf: string) {
    return prisma.patients.findFirst({ where: { cpf } })
  }

  // ─── profiles ───

  async findProfileByUserId(userId: string) {
    return prisma.profiles.findUnique({ where: { id: userId } })
  }

  // ─── clinics ───

  async findClinicById(id: string) {
    return prisma.clinics.findUnique({ where: { id } })
  }

  // ─── permissions ───

  async findUserPermissions(userId: string) {
    return prisma.user_module_permissions.findMany({
      where: { user_id: userId },
    })
  }

  async findModulesByIds(moduleIds: number[]) {
    if (moduleIds.length === 0) return []
    return prisma.module_catalog.findMany({
      where: { id: { in: moduleIds } },
    })
  }
}
