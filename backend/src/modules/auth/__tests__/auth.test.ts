import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { createAuthRouter } from "../api/router";
import { errorHandler } from "../../../middleware/errorHandler";
import bcrypt from "bcrypt";

// Mock Prisma client
jest.mock("../../../infrastructure/database/prismaClient", () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
    profiles: { findUnique: jest.fn() },
    clinics: { findUnique: jest.fn() },
    users: { findUnique: jest.fn() },
    user_module_permissions: { findMany: jest.fn() },
    module_catalog: { findMany: jest.fn() },
  },
}));

import { prisma } from "../../../infrastructure/database/prismaClient";

const JWT_SECRET = "test-jwt-secret-for-auth-tests";
process.env.JWT_SECRET = JWT_SECRET;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/auth", createAuthRouter());
  app.use(errorHandler);
  return app;
}

describe("Auth Module — Integration Tests", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.AUTH_ALLOW_MOCK;
    app = buildApp();
  });

  afterEach(() => {
    delete process.env.AUTH_ALLOW_MOCK;
  });

  describe("POST /auth/token (login)", () => {
    it("returns 400 when email or password is missing", async () => {
      const res = await request(app)
        .post("/auth/token")
        .send({ email: "a@b.com" });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe("GENERIC_VALIDATION_ERROR");
    });

    it("returns 401 for invalid credentials (user not found)", async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      const res = await request(app)
        .post("/auth/token")
        .send({ email: "unknown@clinic.com", password: "wrong" });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_INVALID_CREDENTIALS");
    });

    it("returns 401 when password does not match", async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        {
          id: "user-1",
          email: "user@clinic.com",
          password_hash:
            "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
          role: "ADMIN",
          clinic_id: "clinic-1",
        },
      ]);
      const res = await request(app)
        .post("/auth/token")
        .send({ email: "user@clinic.com", password: "wrong-password" });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe("AUTH_INVALID_CREDENTIALS");
    });

    it("returns 200 with JWT tokens on valid credentials", async () => {
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValueOnce(true);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@clinic.com",
          password_hash: "any-hash-will-do-because-bcrypt-is-mocked",
          role: "ADMIN",
          clinic_id: "clinic-1",
        },
      ]);

      const res = await request(app)
        .post("/auth/token")
        .send({ email: "admin@clinic.com", password: "correct-password" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe("admin@clinic.com");

      // Verify JWT structure
      const decoded = jwt.verify(res.body.accessToken, JWT_SECRET) as {
        sub: string;
        role: string;
      };
      expect(decoded.sub).toBe("user-1");
      expect(decoded.role).toBe("ADMIN");
    });
  });

  describe("GET /auth/user", () => {
    it("returns 401 when no authorization header is provided", async () => {
      const res = await request(app).get("/auth/user");
      expect(res.status).toBe(401);
    });

    it("returns 401 for an invalid token", async () => {
      const res = await request(app)
        .get("/auth/user")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).toBe(401);
    });

    it("returns user data for a valid token", async () => {
      const token = jwt.sign(
        {
          sub: "user-123",
          email: "test@clinic.com",
          role: "ADMIN",
          clinicId: "clinic-1",
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );
      const res = await request(app)
        .get("/auth/user")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("test@clinic.com");
    });
  });

  describe("POST /auth/logout", () => {
    it("returns 204 and clears cookies", async () => {
      const res = await request(app).post("/auth/logout");
      expect(res.status).toBe(204);
    });
  });

  describe("GET /auth/user/:id/metadata", () => {
    it("returns 404 when profile is not found (no mock)", async () => {
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce(null);
      const res = await request(app).get("/auth/user/unknown-id/metadata");
      expect(res.status).toBe(404);
    });

    it("returns profile, clinic and permissions for an admin user", async () => {
      (prisma.profiles.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-1",
        app_role: "ADMIN",
        clinic_id: "clinic-1",
        avatar_url: null,
        full_name: "Dr. Test",
      });
      (prisma.clinics.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "clinic-1",
        name: "Test Clinic",
      });

      const res = await request(app).get("/auth/user/user-1/metadata");
      expect(res.status).toBe(200);
      expect(res.body.roleData.role).toBe("ADMIN");
      expect(res.body.clinicData.name).toBe("Test Clinic");
      expect(res.body.permissionsData).toContain("ALL");
    });
  });

  describe("Mock mode fallback (AUTH_ALLOW_MOCK=true)", () => {
    beforeEach(() => {
      process.env.AUTH_ALLOW_MOCK = "true";
    });

    afterEach(() => {
      delete process.env.AUTH_ALLOW_MOCK;
    });

    it("returns mock tokens when DB is empty but mock is allowed", async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(
        new Error("DB down"),
      );
      const res = await request(app)
        .post("/auth/token")
        .send({ email: "admin@clinic.com", password: "correct" });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");
      const decoded = jwt.verify(res.body.accessToken, JWT_SECRET) as {
        role: string;
      };
      expect(decoded.role).toBe("authenticated");
    });
  });
});
