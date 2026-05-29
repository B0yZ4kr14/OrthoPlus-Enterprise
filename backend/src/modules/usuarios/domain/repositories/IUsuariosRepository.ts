import { Prisma } from "@prisma/client";
import type { profiles, users } from "@prisma/client";

/**
 * IUsuariosRepository — interface for usuarios module database access.
 * Decouples controller from Prisma / infrastructure details.
 */
export interface IUsuariosRepository {
  findProfilesByClinic(clinicId: string): Promise<profiles[]>;
  findProfileByIdAndClinic(
    id: string,
    clinicId: string,
  ): Promise<profiles | null>;
  createProfile(data: Prisma.profilesCreateInput): Promise<profiles>;
  updateProfile(
    id: string,
    clinicId: string,
    data: Prisma.profilesUpdateManyMutationInput,
  ): Promise<Prisma.BatchPayload>;
  updateOwnProfile(
    id: string,
    data: Prisma.profilesUpdateInput,
  ): Promise<profiles>;
  deleteProfilesByIdAndClinic(
    id: string,
    clinicId: string,
  ): Promise<Prisma.BatchPayload>;
  findUsersByIds(
    ids: string[],
  ): Promise<Pick<users, "id" | "email" | "last_sign_in_at">[]>;
  createUser(data: Prisma.usersCreateInput): Promise<users>;
  updateUser(id: string, data: Prisma.usersUpdateInput): Promise<users>;
  deleteUser(id: string): Promise<users>;
}
