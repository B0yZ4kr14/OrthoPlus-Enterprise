import { Errors } from "@/middleware/errorHandler"
import { UserRepository } from "@/modules/auth/infrastructure/UserRepository"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }
  return secret
}

export interface AuthenticateUserResult {
  user: {
    id: string
    email: string
    role: string
    clinicId: string
  }
  accessToken: string
  refreshToken: string
}

/**
 * AuthenticateUserUseCase — authenticates a staff user via email/password.
 */
export class AuthenticateUserUseCase {
  private repo = new UserRepository()

  async execute(email: string, password: string): Promise<AuthenticateUserResult | null> {
    const user = await this.repo.findUserByEmail(email)

    if (!user) {
      return null
    }

    if (!user.is_active) {
      throw Errors.invalidCredentials()
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      throw Errors.invalidCredentials()
    }

    const clinicId = user.clinic_id
    if (!clinicId) {
      throw Errors.noClinicAssigned()
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, clinicId },
      requireJwtSecret(),
      { expiresIn: "1h" },
    )

    const refreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    )

    return {
      user: { id: user.id, email: user.email, role: user.role, clinicId },
      accessToken,
      refreshToken,
    }
  }
}
