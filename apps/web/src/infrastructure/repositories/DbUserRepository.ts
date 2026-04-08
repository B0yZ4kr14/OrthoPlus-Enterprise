import { User } from "@/domain/entities/User";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors";
import { UserMapper } from "../mappers/UserMapper";
import type { Tables } from "@/types/database";

export class DbUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const data = await apiClient.get<Tables<"profiles">>(`/usuarios/${id}`);
      if (!data) return null;
      // @ts-expect-error — TS2339
      return UserMapper.toDomain(data, data.email || "");
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro inesperado ao buscar usuário", error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const data = await apiClient.get<Tables<"profiles">>(`/auth/users`, {
        params: { email },
      });
      const authUser =
        // @ts-expect-error — TS2339
        data?.users?.find((u: Tables<"profiles">) => u.email === email) ||
        // @ts-expect-error — TS2339
        (data && data.email === email ? data : null);

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
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<Tables<"profiles">>("/usuarios", {
        params: { clinicId },
      });
      // @ts-expect-error — TS2339
      const profiles = data.users || data || [];

      return profiles.map((profile: Tables<"profiles">) =>
        // @ts-expect-error — TS2339
        UserMapper.toDomain(profile, profile.email || ""),
      );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findActiveByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<Tables<"profiles">>("/usuarios", {
        params: { clinicId },
      });
      // @ts-expect-error — TS2339
      const profiles = data.users || data || [];

      return profiles
        .filter((profile: Tables<"profiles">) => profile.is_active !== false)
        .map((profile: Tables<"profiles">) =>
          // @ts-expect-error — TS2339
          UserMapper.toDomain(profile, profile.email || ""),
        );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar usuários ativos",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async findAdminsByClinicId(clinicId: string): Promise<User[]> {
    try {
      const data = await apiClient.get<Tables<"profiles">>("/usuarios", {
        params: { clinicId },
      });
      // @ts-expect-error — TS2339
      const profiles = data.users || data || [];

      return profiles
        .filter((profile: Tables<"profiles">) => profile.app_role === "ADMIN")
        .map((profile: Tables<"profiles">) =>
          // @ts-expect-error — TS2339
          UserMapper.toDomain(profile, profile.email || ""),
        );
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError(
        "Erro inesperado ao buscar administradores",
        // @ts-expect-error — TS2345
        error,
      );
    }
  }

  async save(user: User): Promise<void> {
    try {
      const data = UserMapper.toPersistence(user);
      await apiClient.post("/usuarios", data);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      // @ts-expect-error — TS2345
      throw new InfrastructureError("Erro inesperado ao salvar usuário", error);
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
        // @ts-expect-error — TS2345
        error,
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
        // @ts-expect-error — TS2345
        error,
      );
    }
  }
}
