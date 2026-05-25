import { Errors } from "@/middleware/errorHandler"
import { IUserRepository } from "@/modules/auth/domain/repositories/IUserRepository"
import { AuditLogRepository } from "@/modules/database_admin/infrastructure/AuditLogRepository"
import { MetricsEmitter } from "@/infrastructure/metrics"
import bcrypt from "bcrypt"

export interface RegisterUserResult {
  id: string
  email: string
  role: string
  clinicId: string | null
}

/**
 * RegisterUserUseCase — registers a new staff user.
 */
export class RegisterUserUseCase {
  private repo: IUserRepository
  private audit = new AuditLogRepository()

  constructor(repo?: IUserRepository) {
    this.repo = repo ?? new (require("@/modules/auth/infrastructure/UserRepository").UserRepository)()
  }

  async execute(
    email: string,
    password: string,
    role: string,
    clinicId: string,
  ): Promise<RegisterUserResult> {
    const existing = await this.repo.findUserByEmail(email)
    if (existing) {
      throw Errors.conflict("Email already in use")
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await this.repo.createUser({
      email,
      password_hash: passwordHash,
      role,
      clinic_id: clinicId,
      is_active: true,
    })

    MetricsEmitter.incrementCounter("auth_user_registered", "New user registrations", { role, clinicId })

    try {
      await this.audit.createLog({
        table_name: "users",
        record_id: newUser.id,
        action: "CREATE",
        clinic_id: clinicId,
        user_id: newUser.id,
        old_data: null,
        new_data: { id: newUser.id, email: newUser.email, role: newUser.role, clinic_id: clinicId },
        created_at: new Date(),
      })
    } catch { /* audit failure is non-blocking */ }

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      clinicId: newUser.clinic_id,
    }
  }
}
