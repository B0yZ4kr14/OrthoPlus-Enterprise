import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { ApiError, Errors, asyncHandler } from "@/middleware/errorHandler";
import type { LoginRequest } from "@orthoplus/shared-types";
import { AuthService } from "@/modules/auth/application/AuthService";

/**
 * Authentication controller for staff.
 * Delegates all business logic to AuthService.
 */

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 3600 * 1000,
  path: "/",
};

function getToken(req: Request): string | undefined {
  const cookieToken = (req as Request & { cookies?: Record<string, string> })
    .cookies?.access_token;
  const authHeader = req.headers.authorization;
  return (
    cookieToken ||
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined)
  );
}

function allowMock(): boolean {
  return process.env.AUTH_ALLOW_MOCK === "true";
}

export class AuthController {
  private authService = new AuthService();

  // POST /auth/login
  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      throw Errors.validation("Email and password are required", [
        ...(!email
          ? [
              {
                field: "email",
                message: "Email is required",
                code: "VALIDATION_REQUIRED_FIELD" as const,
              },
            ]
          : []),
        ...(!password
          ? [
              {
                field: "password",
                message: "Password is required",
                code: "VALIDATION_REQUIRED_FIELD" as const,
              },
            ]
          : []),
      ]);
    }

    const result = await this.authService.loginStaff(email, password);
    res.cookie("access_token", result.accessToken, COOKIE_OPTIONS);
    res.json(result);
  });

  // GET /auth/user
  public getUser = asyncHandler(async (req: Request, res: Response) => {
    const token = getToken(req);
    if (!token) throw Errors.unauthorized("No authentication token provided");

    try {
      const decoded = this.authService.verifyToken(token);
      res.json({
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.email.split("@")[0],
          role: decoded.role,
          clinicId: decoded.clinicId,
          createdAt: new Date(decoded.iat * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch {
      throw new ApiError(
        401,
        "AUTH_TOKEN_INVALID",
        "Invalid Token",
        "The provided token is invalid or expired",
      );
    }
  });

  // POST /auth/logout
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

  // POST /auth/refresh
  public refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    if (!refreshToken) throw Errors.validation("Refresh token is required");

    try {
      const tokens = await this.authService.refreshAccessToken(refreshToken);
      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600,
      });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw Errors.tokenExpired();
    }
  });

  // POST /auth/patient
  public patientAuth = asyncHandler(async (req: Request, res: Response) => {
    const { cpf, birthDate } = req.body as { cpf?: string; birthDate?: string };

    if (!cpf || !birthDate) {
      throw Errors.validation("CPF and birth date are required", [
        ...(!cpf
          ? [
              {
                field: "cpf",
                message: "CPF is required",
                code: "VALIDATION_REQUIRED_FIELD" as const,
              },
            ]
          : []),
        ...(!birthDate
          ? [
              {
                field: "birthDate",
                message: "Birth date is required",
                code: "VALIDATION_REQUIRED_FIELD" as const,
              },
            ]
          : []),
      ]);
    }

    const normalizedCpf = cpf.replace(/\D/g, "");
    const result = await this.authService.loginPatient(
      normalizedCpf,
      birthDate,
    );
    res.cookie("access_token", result.access_token, COOKIE_OPTIONS);
    res.json(result);
  });

  // GET /auth/user/:id/metadata
  public getUserMetadata = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    if (!userId) throw Errors.validation("User ID is required");

    try {
      const metadata = await this.authService.getUserMetadata(userId);
      if (metadata) {
        res.json(metadata);
        return;
      }
    } catch (err) {
      logger.error("getUserMetadata error", { error: err });
      throw Errors.internal("Error loading user metadata");
    }

    if (allowMock()) {
      res.json(this.authService.buildMockUserMetadata());
      return;
    }

    throw Errors.notFound("User", userId);
  });

  // POST /auth/register
  public registerStaff = asyncHandler(async (req: Request, res: Response) => {
    const caller = req.user;
    const hasPermission =
      caller?.role === "ADMIN" ||
      caller?.role === "ROOT" ||
      (allowMock() && caller?.role === "authenticated");
    if (!caller || !hasPermission)
      throw Errors.forbidden("Admin role required to register staff");

    const { email, password, role, clinicId } = req.body as {
      email?: string;
      password?: string;
      role?: string;
      clinicId?: string;
    };

    const validationErrors = [];
    if (!email)
      validationErrors.push({
        field: "email",
        message: "Email is required",
        code: "VALIDATION_REQUIRED_FIELD" as const,
      });
    if (!password)
      validationErrors.push({
        field: "password",
        message: "Password is required",
        code: "VALIDATION_REQUIRED_FIELD" as const,
      });
    if (!role)
      validationErrors.push({
        field: "role",
        message: "Role is required",
        code: "VALIDATION_REQUIRED_FIELD" as const,
      });
    if (!clinicId)
      validationErrors.push({
        field: "clinicId",
        message: "Clinic ID is required",
        code: "VALIDATION_REQUIRED_FIELD" as const,
      });
    if (validationErrors.length > 0)
      throw Errors.validation("Required fields are missing", validationErrors);

    const allowedRoles = ["ADMIN", "MEMBER", "ROOT"];
    if (!allowedRoles.includes(role!)) {
      throw Errors.validation(
        `Role must be one of: ${allowedRoles.join(", ")}`,
        [
          {
            field: "role",
            message: `Role must be one of: ${allowedRoles.join(", ")}`,
            code: "VALIDATION_INVALID_FORMAT",
          },
        ],
      );
    }

    try {
      const newUser = await this.authService.registerStaff(
        email!,
        password!,
        role!,
        clinicId!,
      );
      res
        .status(201)
        .json({
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            clinicId: newUser.clinicId,
          },
        });
    } catch (err) {
      if (err instanceof ApiError) throw err;
      logger.error("registerStaff error", { error: err });
      throw Errors.internal("Error registering user");
    }
  });

  // POST /auth/reset-password
  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) throw Errors.validation("Email is required");
    logger.info("Password reset requested", { email });
    res.status(200).json({ message: "Password reset instructions sent" });
  });
}
