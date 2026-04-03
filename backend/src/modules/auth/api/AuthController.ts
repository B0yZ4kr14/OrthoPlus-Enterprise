import { logger } from '@/infrastructure/logger';
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "@/infrastructure/database/prismaClient";
import { ApiError, Errors, ErrorCodes, asyncHandler } from "@/middleware/errorHandler";
import type { LoginRequest, LoginResponse, User, JWTPayload } from "@orthoplus/shared-types";

/**
 * Authentication controller for staff.
 * 
 * REFACTORED: Now uses RFC 7807 Problem Details for consistent error responses
 * and shared types for type-safe API communication.
 *
 * Login flow:
 * 1. Always try real database lookup + bcrypt verification first.
 * 2. If the real lookup finds a valid user, issue a real JWT and set an HttpOnly cookie.
 * 3. Only fall back to mock credentials when AUTH_ALLOW_MOCK=true AND the real lookup
 *    fails or finds no matching user — this keeps dev/test working while prod always
 *    uses the real path.
 *
 * For production always ensure AUTH_ALLOW_MOCK is NOT set to "true".
 */

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 3600 * 1000, // 1 hour
  path: "/",
};

/** Shape of a row returned from the `users` table. */
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  clinic_id: string | null;
}

/** Shape of a row returned from the `profiles` table. */
interface ProfileRow {
  id: string;
  app_role: string | null;
  clinic_id: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

/** Shape of a row returned from the `clinics` table. */
interface ClinicRow {
  id: string;
  name: string;
}

export class AuthController {
  /**
   * POST /auth/login
   * Authenticates a staff user and returns JWT tokens.
   * 
   * Response follows LoginResponse type from shared-types.
   */
  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest;
    
    // Validation with detailed error
    if (!email || !password) {
      throw Errors.validation("Email and password are required", [
        ...(!email ? [{ field: "email", message: "Email is required", code: "VALIDATION_REQUIRED_FIELD" as const }] : []),
        ...(!password ? [{ field: "password", message: "Password is required", code: "VALIDATION_REQUIRED_FIELD" as const }] : []),
      ]);
    }

    const allowMock = process.env.AUTH_ALLOW_MOCK === "true";

    // STEP 1: Always try real database lookup first.
    try {
      const rows = await prisma.$queryRaw<UserRow[]>`
        SELECT id, email, password_hash, role, clinic_id
        FROM users
        WHERE email = ${email}
          AND is_active = true
        LIMIT 1
      `;

      const user = rows[0];
      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
          throw Errors.invalidCredentials();
        }

        const clinicId = user.clinic_id;
        if (!clinicId) {
          throw Errors.noClinicAssigned();
        }

        const token = jwt.sign(
          { sub: user.id, email: user.email, role: user.role, clinicId },
          requireJwtSecret(),
          { expiresIn: "1h" },
        );

        // Generate refresh token (TODO: store in database)
        const refreshToken = jwt.sign(
          { sub: user.id, type: "refresh" },
          requireJwtSecret(),
          { expiresIn: "7d" },
        );

        res.cookie("access_token", token, COOKIE_OPTIONS);
        
        const response: LoginResponse = {
          user: {
            id: user.id,
            email: user.email,
            name: user.email.split("@")[0], // TODO: fetch from profiles
            role: user.role as any,
            clinicId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          clinic: {
            id: clinicId,
            name: "Clinic Name", // TODO: fetch from database
            settings: {
              timezone: "America/Sao_Paulo",
              currency: "BRL",
              language: "pt-BR",
              dateFormat: "DD/MM/YYYY",
              timeFormat: "24h",
            },
            activeModules: [],
          },
          accessToken: token,
          refreshToken,
          expiresIn: 3600,
        };

        res.json(response);
        return;
      }
    } catch (err) {
      // If it's an ApiError, re-throw it
      if (err instanceof ApiError) {
        throw err;
      }
      
      // If DB is unavailable and mock is not allowed, surface the error.
      if (!allowMock) {
        logger.error("Login DB error", { error: err });
        throw Errors.database("Database error during authentication");
      }
      // DB error but mock is allowed — fall through to mock path below.
      logger.warn("Login DB error, falling back to mock mode", { error: err });
    }

    // STEP 2: No real user found. Fall back to mock if AUTH_ALLOW_MOCK=true.
    if (!allowMock) {
      throw Errors.invalidCredentials();
    }

    const mockEmail = process.env.MOCK_ADMIN_EMAIL || "admin@clinic.com";
    const mockPassword = process.env.MOCK_ADMIN_PASSWORD || "correct";
    if (email !== mockEmail || password !== mockPassword) {
      throw Errors.invalidCredentials();
    }

    const dummyId = "00000000-0000-0000-0000-000000000000";
    const clinicId = "mock-clinic-id";

    const token = jwt.sign(
      { sub: dummyId, email, role: "authenticated", clinicId },
      requireJwtSecret(),
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { sub: dummyId, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    );

    res.cookie("access_token", token, COOKIE_OPTIONS);
    
    const mockResponse: LoginResponse = {
      user: {
        id: dummyId,
        email,
        name: "Mock Admin",
        role: "admin",
        clinicId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      clinic: {
        id: clinicId,
        name: "Clinica Mock",
        settings: {
          timezone: "America/Sao_Paulo",
          currency: "BRL",
          language: "pt-BR",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24h",
        },
        activeModules: [],
      },
      accessToken: token,
      refreshToken,
      expiresIn: 3600,
    };

    res.json(mockResponse);
  });

  /**
   * GET /auth/user
   * Returns current authenticated user info.
   */
  public getUser = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw Errors.unauthorized("No authorization header provided");
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, requireJwtSecret()) as JWTPayload;

      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.email.split("@")[0],
        role: decoded.role as any,
        clinicId: decoded.clinicId,
        createdAt: new Date(decoded.iat * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.json({ user });
    } catch {
      throw new ApiError(401, "AUTH_TOKEN_INVALID", "Invalid Token", "The provided token is invalid or expired");
    }
  });

  /**
   * POST /auth/logout
   * Clears authentication cookies.
   */
  public logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(204).send();
  });

  /**
   * POST /auth/refresh
   * Refreshes access token using refresh token.
   * TODO: Implement refresh token rotation with database storage
   */
  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw Errors.validation("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, requireJwtSecret()) as { sub: string; type: string };
      
      if (decoded.type !== "refresh") {
        throw new ApiError(401, "AUTH_TOKEN_INVALID", "Invalid Token Type", "Token is not a refresh token");
      }

      // TODO: Verify refresh token in database and rotate it
      
      const user = await prisma.users.findUnique({ where: { id: decoded.sub } });
      if (!user) {
        throw Errors.notFound("User", decoded.sub);
      }

      const newAccessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role, clinicId: user.clinic_id },
        requireJwtSecret(),
        { expiresIn: "1h" },
      );

      const newRefreshToken = jwt.sign(
        { sub: user.id, type: "refresh" },
        requireJwtSecret(),
        { expiresIn: "7d" },
      );

      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw Errors.tokenExpired();
    }
  });

  /**
   * POST /auth/patient
   * Authenticates a patient using CPF and birth date.
   */
  public patientAuth = asyncHandler(async (req: Request, res: Response) => {
    const { cpf, birthDate } = req.body as { cpf?: string; birthDate?: string };
    
    if (!cpf || !birthDate) {
      throw Errors.validation("CPF and birth date are required", [
        ...(!cpf ? [{ field: "cpf", message: "CPF is required", code: "VALIDATION_REQUIRED_FIELD" as const }] : []),
        ...(!birthDate ? [{ field: "birthDate", message: "Birth date is required", code: "VALIDATION_REQUIRED_FIELD" as const }] : []),
      ]);
    }

    const allowMock = process.env.AUTH_ALLOW_MOCK === "true";
    const normalizedCpf = cpf.replace(/\D/g, "");

    // STEP 1: Always try real database lookup first.
    try {
      const rows = await prisma.$queryRaw<Array<{ id: string; clinic_id: string; birth_date: Date }>>`
        SELECT id, clinic_id, birth_date
        FROM patients
        WHERE cpf = ${normalizedCpf}
          AND is_active = true
        LIMIT 1
      `;

      const patient = rows[0];
      if (patient) {
        // Verify birth date matches
        const patientBirth = new Date(patient.birth_date).toISOString().split("T")[0];
        if (patientBirth !== birthDate) {
          throw Errors.invalidCredentials();
        }

        const clinicId = patient.clinic_id;
        if (!clinicId) {
          throw new ApiError(403, ErrorCodes.AUTH_NO_CLINIC, "No Clinic Assigned", "Patient has no clinic associated");
        }

        const patientEmail = `patient-${normalizedCpf}@portal`;
        const token = jwt.sign(
          { sub: patient.id, email: patientEmail, role: "patient", clinicId },
          requireJwtSecret(),
          { expiresIn: "1h" },
        );

        const refreshToken = jwt.sign(
          { sub: patient.id, type: "refresh" },
          requireJwtSecret(),
          { expiresIn: "7d" },
        );

        res.cookie("access_token", token, COOKIE_OPTIONS);
        res.json({
          access_token: token,
          token_type: "bearer",
          expires_in: 3600,
          refresh_token: refreshToken,
          user: {
            id: patient.id,
            aud: "authenticated",
            role: "patient",
            email: patientEmail,
          },
        });
        return;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      
      if (!allowMock) {
        logger.error("Patient auth DB error", { error: err });
        throw Errors.database("Database error during patient authentication");
      }
      
      logger.warn("Patient auth DB error, falling back to mock mode", { error: err });
    }

    // STEP 2: No real patient found. Fall back to mock only if AUTH_ALLOW_MOCK=true.
    if (!allowMock) {
      throw Errors.invalidCredentials();
    }

    const dummyId = "patient-0000-0000-0000-000000000000";
    const patientEmail = `patient-${normalizedCpf}@example.com`;
    const clinicId = "mock-clinic-id";

    const token = jwt.sign(
      { sub: dummyId, email: patientEmail, role: "patient", clinicId },
      requireJwtSecret(),
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { sub: dummyId, type: "refresh" },
      requireJwtSecret(),
      { expiresIn: "7d" },
    );

    res.cookie("access_token", token, COOKIE_OPTIONS);
    res.json({
      access_token: token,
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      user: {
        id: dummyId,
        aud: "authenticated",
        role: "patient",
        email: patientEmail,
      },
    });
  });

  // ... rest of methods with similar refactoring
  public getUserMetadata = asyncHandler(async (req: Request, res: Response) => {
    const allowMock = process.env.AUTH_ALLOW_MOCK === "true";
    const userId = req.params.id;
    
    if (!userId) {
      throw Errors.validation("User ID is required");
    }

    try {
      const profile = await prisma.profiles.findUnique({ where: { id: userId } }) as ProfileRow | null;

      if (profile) {
        let clinicData: ClinicRow | null = null;
        if (profile.clinic_id) {
          clinicData = await prisma.clinics.findUnique({ where: { id: profile.clinic_id } }) as ClinicRow | null;
          if (!clinicData) {
            logger.warn(`[getUserMetadata] Clinic ${profile.clinic_id} not found for user ${userId}`);
          }
        }

        const role = profile.app_role || "MEMBER";
        let permissionsData: string[];
        if (role === "ADMIN" || role === "ROOT") {
          permissionsData = ["ALL"];
        } else {
          const permissions = await prisma.user_module_permissions.findMany({
            where: { user_id: userId },
          });
          if (permissions.length > 0) {
            const moduleIds = permissions
              .filter((p) => p.can_view)
              .map((p) => p.module_catalog_id);
            const modules = await prisma.module_catalog.findMany({
              where: { id: { in: moduleIds } },
              select: { module_key: true },
            });
            permissionsData = modules.map((m) => m.module_key);
          } else {
            permissionsData = [];
          }
        }

        res.json({
          roleData: { role },
          profileData: {
            clinic_id: profile.clinic_id || "",
            avatar_url: profile.avatar_url || "",
            full_name: profile.full_name || "",
          },
          clinicData: clinicData
            ? { id: clinicData.id, name: clinicData.name }
            : { id: profile.clinic_id || "", name: "Unknown Clinic" },
          permissionsData,
        });
        return;
      }
    } catch (err) {
      logger.error("getUserMetadata error", { error: err });
      throw Errors.internal("Error loading user metadata");
    }

    // No real profile found — fall back to mock only if AUTH_ALLOW_MOCK=true.
    if (allowMock) {
      res.json({
        roleData: { role: "ADMIN" },
        profileData: {
          clinic_id: "mock-clinic-id",
          avatar_url: "",
          full_name: "Mock Admin",
        },
        clinicData: { id: "mock-clinic-id", name: "Clinica Mock E2E" },
        permissionsData: ["ALL"],
      });
      return;
    }

    throw Errors.notFound("User", userId);
  });

  /**
   * POST /auth/register
   * Creates a new staff user. Requires ADMIN or ROOT role from a valid JWT.
   */
  public registerStaff = asyncHandler(async (req: Request, res: Response) => {
    const caller = req.user;
    const allowMock = process.env.AUTH_ALLOW_MOCK === "true";
    
    // Allow ADMIN/ROOT in production; also allow mock-mode 'authenticated' role in dev/test
    const hasPermission =
      caller?.role === "ADMIN" ||
      caller?.role === "ROOT" ||
      (allowMock && caller?.role === "authenticated");
      
    if (!caller || !hasPermission) {
      throw Errors.forbidden("Admin role required to register staff");
    }

    const { email, password, role, clinicId } = req.body as {
      email?: string;
      password?: string;
      role?: string;
      clinicId?: string;
    };

    // Validation with detailed errors
    const validationErrors = [];
    if (!email) validationErrors.push({ field: "email", message: "Email is required", code: "VALIDATION_REQUIRED_FIELD" as const });
    if (!password) validationErrors.push({ field: "password", message: "Password is required", code: "VALIDATION_REQUIRED_FIELD" as const });
    if (!role) validationErrors.push({ field: "role", message: "Role is required", code: "VALIDATION_REQUIRED_FIELD" as const });
    if (!clinicId) validationErrors.push({ field: "clinicId", message: "Clinic ID is required", code: "VALIDATION_REQUIRED_FIELD" as const });
    
    if (validationErrors.length > 0) {
      throw Errors.validation("Required fields are missing", validationErrors);
    }

    const allowedRoles = ["ADMIN", "MEMBER", "ROOT"];
    if (!allowedRoles.includes(role!)) {
      throw Errors.validation(`Role must be one of: ${allowedRoles.join(", ")}`, [{
        field: "role",
        message: `Role must be one of: ${allowedRoles.join(", ")}`,
        code: "VALIDATION_INVALID_FORMAT",
      }]);
    }

    try {
      const existing = await prisma.$queryRaw<UserRow[]>`
        SELECT id FROM users WHERE email = ${email} LIMIT 1
      `;
      if (existing.length > 0) {
        throw Errors.conflict("Email already in use");
      }

      const passwordHash = await bcrypt.hash(password!, 12);
      const newId = crypto.randomUUID();

      await prisma.$executeRaw`
        INSERT INTO users (id, email, password_hash, role, clinic_id, is_active, created_at, updated_at)
        VALUES (
          ${newId}::uuid,
          ${email},
          ${passwordHash},
          ${role},
          ${clinicId}::uuid,
          true,
          NOW(),
          NOW()
        )
      `;

      res.status(201).json({
        user: { id: newId, email, role, clinicId },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      logger.error("registerStaff error", { error: err });
      throw Errors.internal("Error registering user");
    }
  });
}
