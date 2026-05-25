import { logger } from "@/infrastructure/logger"
import { ApiError, Errors, ErrorCodes } from "@/middleware/errorHandler"
import { UserRepository } from "@/modules/auth/infrastructure/UserRepository"
import jwt from "jsonwebtoken"

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }
  return secret
}

export interface PatientAuthResult {
  patientId: string
  clinicId: string
  accessToken: string
  refreshToken: string
}

export interface UserMetadataResult {
  roleData: { role: string }
  profileData: {
    clinic_id: string
    avatar_url: string
    full_name: string
  }
  clinicData: { id: string; name: string }
  permissionsData: string[]
}

export class AuthService {
  private repo = new UserRepository()

  // ─── Staff Login ───

  async authenticateStaff(email: string, password: string) {
    const { AuthenticateUserUseCase } = await import("./AuthenticateUserUseCase")
    const useCase = new AuthenticateUserUseCase()
    return useCase.execute(email, password)
  }

  // ─── Token Refresh ───

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = jwt.verify(refreshToken, requireJwtSecret()) as { sub: string; type: string }

    if (decoded.type !== "refresh") {
      throw new ApiError(401, ErrorCodes.AUTH_TOKEN_INVALID, "Invalid Token Type", "Token is not a refresh token")
    }

    const user = await this.repo.findUserById(decoded.sub)
    if (!user) {
      throw Errors.notFound("User", decoded.sub)
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, clinicId: user.clinic_id },
      requireJwtSecret(),
      { expiresIn: "1h" },
    )

    const newRefreshToken = jwt.sign(
      { sub: user.id, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    )

    return { accessToken, refreshToken: newRefreshToken }
  }

  // ─── Patient Auth ───

  async authenticatePatient(cpf: string, birthDate: string): Promise<PatientAuthResult | null> {
    const patient = await this.repo.findPatientByCpf(cpf)

    if (!patient) {
      return null
    }

    const patientBirth = new Date(patient.birth_date).toISOString().split("T")[0]
    if (patientBirth !== birthDate) {
      throw Errors.invalidCredentials()
    }

    const clinicId = patient.clinic_id
    if (!clinicId) {
      throw new ApiError(403, ErrorCodes.AUTH_NO_CLINIC, "No Clinic Assigned", "Patient has no clinic associated")
    }

    const patientEmail = `patient-${cpf}@portal`
    const accessToken = jwt.sign(
      { sub: patient.id, email: patientEmail, role: "patient", clinicId },
      requireJwtSecret(),
      { expiresIn: "1h" },
    )

    const refreshToken = jwt.sign(
      { sub: patient.id, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    )

    return { patientId: patient.id, clinicId, accessToken, refreshToken }
  }

  // ─── User Metadata ───

  async getUserMetadata(userId: string): Promise<UserMetadataResult | null> {
    const profile = await this.repo.findProfileByUserId(userId)

    if (!profile) {
      return null
    }

    let clinicData: { id: string; name: string } | null = null
    if (profile.clinic_id) {
      const clinic = await this.repo.findClinicById(profile.clinic_id)
      if (clinic) {
        clinicData = { id: clinic.id, name: clinic.name }
      } else {
        logger.warn(`[getUserMetadata] Clinic ${profile.clinic_id} not found for user ${userId}`)
      }
    }

    const role = profile.app_role || "MEMBER"
    let permissionsData: string[]

    if (role === "ADMIN" || role === "ROOT") {
      permissionsData = ["ALL"]
    } else {
      const permissions = await this.repo.findUserPermissions(userId)
      if (permissions.length > 0) {
        const moduleIds = permissions.filter((p) => p.can_view).map((p) => p.module_catalog_id)
        const modules = await this.repo.findModulesByIds(moduleIds)
        permissionsData = modules.map((m: any) => m.module_key)
      } else {
        permissionsData = []
      }
    }

    return {
      roleData: { role },
      profileData: {
        clinic_id: profile.clinic_id || "",
        avatar_url: profile.avatar_url || "",
        full_name: profile.full_name || "",
      },
      clinicData: clinicData || { id: profile.clinic_id || "", name: "Unknown Clinic" },
      permissionsData,
    }
  }

  // ─── Register Staff ───

  async registerStaff(
    email: string,
    password: string,
    role: string,
    clinicId: string,
  ): Promise<{ id: string; email: string; role: string; clinicId: string | null }> {
    const { RegisterUserUseCase } = await import("./RegisterUserUseCase")
    const useCase = new RegisterUserUseCase()
    return useCase.execute(email, password, role, clinicId)
  }
}
