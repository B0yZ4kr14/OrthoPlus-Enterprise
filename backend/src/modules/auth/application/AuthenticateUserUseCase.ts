import { Errors } from "@/middleware/errorHandler";
import { IUserRepository } from "@/modules/auth/domain/repositories/IUserRepository";
import { AuditLogRepository } from "@/modules/database_admin/infrastructure/AuditLogRepository";
import { MetricsEmitter } from "@/infrastructure/metrics";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { UserRepository } from "@/modules/auth/infrastructure/UserRepository";

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw Errors.internal("JWT_SECRET is not configured");
  }
  return secret;
}

export interface AuthenticateUserResult {
  user: {
    id: string;
    email: string;
    role: string;
    clinicId: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * AuthenticateUserUseCase — authenticates a staff user via email/password.
 */
export class AuthenticateUserUseCase {
  private repo: IUserRepository;
  private audit = new AuditLogRepository();

  constructor(repo?: IUserRepository) {
    this.repo = repo ?? new UserRepository();
  }

  async execute(
    email: string,
    password: string,
  ): Promise<AuthenticateUserResult | null> {
    const user = await this.repo.findUserByEmail(email);

    if (!user) {
      MetricsEmitter.incrementCounter(
        "auth_login_failure",
        "Failed authentication attempts",
        { role: "unknown" },
      );
      try {
        await this.audit.createLog({
          table_name: "users",
          record_id: "unknown",
          action: "AUTH_FAILURE",
          clinic_id: "unknown",
          user_id: "unknown",
          old_data: { email },
          new_data: null,
          created_at: new Date(),
        });
      } catch {
        /* audit failure is non-blocking */
      }
      return null;
    }

    if (!user.is_active) {
      MetricsEmitter.incrementCounter(
        "auth_login_failure",
        "Failed authentication attempts",
        { role: user.role },
      );
      try {
        await this.audit.createLog({
          table_name: "users",
          record_id: user.id,
          action: "AUTH_FAILURE",
          clinic_id: user.clinic_id ?? "unknown",
          user_id: user.id,
          old_data: { email, reason: "inactive" },
          new_data: null,
          created_at: new Date(),
        });
      } catch {
        /* audit failure is non-blocking */
      }
      throw Errors.invalidCredentials();
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      MetricsEmitter.incrementCounter(
        "auth_login_failure",
        "Failed authentication attempts",
        { role: user.role },
      );
      try {
        await this.audit.createLog({
          table_name: "users",
          record_id: user.id,
          action: "AUTH_FAILURE",
          clinic_id: user.clinic_id ?? "unknown",
          user_id: user.id,
          old_data: { email, reason: "wrong_password" },
          new_data: null,
          created_at: new Date(),
        });
      } catch {
        /* audit failure is non-blocking */
      }
      throw Errors.invalidCredentials();
    }

    const clinicId = user.clinic_id;
    if (!clinicId) {
      MetricsEmitter.incrementCounter(
        "auth_login_failure",
        "Failed authentication attempts",
        { role: user.role },
      );
      try {
        await this.audit.createLog({
          table_name: "users",
          record_id: user.id,
          action: "AUTH_FAILURE",
          clinic_id: "unknown",
          user_id: user.id,
          old_data: { email, reason: "no_clinic" },
          new_data: null,
          created_at: new Date(),
        });
      } catch {
        /* audit failure is non-blocking */
      }
      throw Errors.noClinicAssigned();
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, clinicId },
      requireJwtSecret(),
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    );

    MetricsEmitter.incrementCounter(
      "auth_login_success",
      "Successful authentication attempts",
      { role: user.role },
    );

    return {
      user: { id: user.id, email: user.email, role: user.role, clinicId },
      accessToken,
      refreshToken,
    };
  }
}
