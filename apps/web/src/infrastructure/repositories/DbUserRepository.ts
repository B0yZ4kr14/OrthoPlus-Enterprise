import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { UserMapper } from "../mappers/UserMapper";
import type { Tables } from "@/types/database";

type ProfileWithEmail = Tables<"profiles"> & { email?: string };

export class DbUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const data = await apiClient.get<ProfileWithEmail>(`/usuarios/${id}`);
      if (!data) return null;
      return UserMapper.toDomain(data, data.email || "");
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuário",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const data = await apiClient.get<unknown>(`/auth/users`, {
        params: { email },
      });
      const dataRecord = data as Record<string, unknown>;
      const users = (dataRecord.users as ProfileWithEmail[] | undefined) || [];
      const authUser =
        users.find((u) => u.email === email) ||
        (dataRecord && (dataRecord as ProfileWithEmail).email === email
          ? (data as ProfileWithEmail)
          : null);

      if (!authUser) return null;

      const profile = await apiClient.get<Tables<"profiles">>(
        `/usuarios/${authUser.id}`,
      );
      if (!profile) return null;

      return UserMapper.toDomain(profile, email);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuário por email",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<unknown>("/usuarios", {
        params: { clinicId },
      });
      const profiles =
        ((data as Record<string, unknown>).users as
          | ProfileWithEmail[]
          | undefined) ||
        (Array.isArray(data) ? (data as ProfileWithEmail[]) : []);

      return profiles.map((profile) =>
        UserMapper.toDomain(profile, profile.email || ""),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<unknown>("/usuarios", {
        params: { clinicId },
      });
      const profiles =
        ((data as Record<string, unknown>).users as
          | ProfileWithEmail[]
          | undefined) ||
        (Array.isArray(data) ? (data as ProfileWithEmail[]) : []);

      return profiles
        .filter((profile) => profile.is_active !== false)
        .map((profile) => UserMapper.toDomain(profile, profile.email || ""));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários ativos",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findAdminsByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<unknown>("/usuarios", {
        params: { clinicId },
      });
      const profiles =
        ((data as Record<string, unknown>).users as
          | ProfileWithEmail[]
          | undefined) ||
        (Array.isArray(data) ? (data as ProfileWithEmail[]) : []);

      return profiles
        .filter((profile) => profile.app_role === "ADMIN")
        .map((profile) => UserMapper.toDomain(profile, profile.email || ""));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar administradores",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await apiClient.post("/usuarios", data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao salvar usuário",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async update(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await apiClient.patch(`/usuarios/${user.id}`, data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao atualizar usuário",
        error instanceof Error ? error : undefined,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.patch(`/usuarios/${id}`, {
        is_active: false,
      });
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao deletar usuário",
        error instanceof Error ? error : undefined,
      );
    }
  }
}
