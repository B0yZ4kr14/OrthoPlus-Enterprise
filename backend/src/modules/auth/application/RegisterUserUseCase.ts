import { Errors } from "@/middleware/errorHandler"
import { UserRepository } from "@/modules/auth/infrastructure/UserRepository"
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
  private repo = new UserRepository()

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

    return {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      clinicId: newUser.clinic_id,
    }
  }
}
