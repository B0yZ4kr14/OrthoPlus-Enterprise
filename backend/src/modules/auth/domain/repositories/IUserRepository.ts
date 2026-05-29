import { Prisma } from "@prisma/client";
import type {
  users,
  patients,
  profiles,
  clinics,
  user_module_permissions,
  module_catalog,
} from "@prisma/client";

/**
 * IUserRepository — interface for auth module database access.
 * Decouples use-cases from Prisma / infrastructure details.
 */

export interface IUserRepository {
  findUserByEmail(email: string): Promise<users | null>;
  findUserById(id: string): Promise<users | null>;
  createUser(data: Prisma.usersCreateInput): Promise<users>;
  findPatientByCpf(cpf: string): Promise<patients | null>;
  findProfileByUserId(userId: string): Promise<profiles | null>;
  findClinicById(id: string): Promise<clinics | null>;
  findUserPermissions(userId: string): Promise<user_module_permissions[]>;
  findModulesByIds(moduleIds: number[]): Promise<module_catalog[]>;
}
