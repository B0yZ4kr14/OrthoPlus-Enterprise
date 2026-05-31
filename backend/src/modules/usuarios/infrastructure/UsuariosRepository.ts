import { prisma } from "@/infrastructure/database/prismaClient";
import { Prisma } from "@prisma/client";
import { IUsuariosRepository } from "@/modules/usuarios/domain/repositories/IUsuariosRepository";

export class UsuariosRepository implements IUsuariosRepository {
  // ── Profiles ──────────────────────────────────────────────────────────

  async findProfilesByClinic(clinicId: string) {
    return prisma.profiles.findMany({ where: { clinic_id: clinicId } });
  }

  async findProfileByIdAndClinic(id: string, clinicId: string) {
    return prisma.profiles.findFirst({ where: { id, clinic_id: clinicId } });
  }

  async createProfile(data: Prisma.profilesCreateInput) {
    return prisma.profiles.create({ data });
  }

  async updateProfile(
    id: string,
    clinicId: string,
    data: Prisma.profilesUpdateManyMutationInput,
  ) {
    return prisma.profiles.updateMany({
      where: { id, clinic_id: clinicId },
      data,
    });
  }

  async updateOwnProfile(id: string, data: Prisma.profilesUpdateInput) {
    return prisma.profiles.update({ where: { id }, data });
  }

  async deleteProfilesByIdAndClinic(id: string, clinicId: string) {
    return prisma.profiles.deleteMany({ where: { id, clinic_id: clinicId } });
  }

  // ── Users ─────────────────────────────────────────────────────────────

  async findUsersByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return prisma.users.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true, last_sign_in_at: true },
    });
  }

  async createUser(data: Prisma.usersCreateInput) {
    return prisma.users.create({ data });
  }

  async updateUser(
    id: string,
    clinicId: string,
    data: Prisma.usersUpdateManyMutationInput,
  ) {
    return prisma.users.updateMany({
      where: { id, clinic_id: clinicId },
      data,
    });
  }

  async deleteUser(id: string, clinicId: string) {
    return prisma.users.deleteMany({ where: { id, clinic_id: clinicId } });
  }
}
