process.env.ENABLE_CRYPTO_MODULE = "true";

import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createAuthRouter } from "../../src/modules/auth/api/router";
import notificationRouter from "../../src/modules/notifications/api/router";
import { CryptoConfigControllerService } from "../../src/modules/crypto_config/application/CryptoConfigControllerService";
import { createCryptoRouter } from "../../src/modules/crypto_config/api/router";
import { errorHandler } from "../../src/middleware/errorHandler";
import { authMiddleware } from "../../src/middleware/authMiddleware";
import cookieParser from "cookie-parser";

jest.mock("../../src/modules/crypto_config/api/exchangeRate", () => ({
  fetchExchangeRateBRL: jest.fn().mockResolvedValue(5.0),
}));

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    $queryRaw: jest.fn(),
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    crypto_offline_wallets: { create: jest.fn() },
    crypto_wallets: { findFirst: jest.fn() },
    crypto_transactions: { findUnique: jest.fn(), create: jest.fn() },
    notifications: { create: jest.fn() },
    audit_logs: { create: jest.fn() },
  },
}));

import { prisma } from "../../src/infrastructure/database/prismaClient";
import bcrypt from "bcrypt";

const JWT_SECRET = crypto.randomBytes(32).toString("hex");
process.env.JWT_SECRET = JWT_SECRET;

function adminTokenFor(clinicId: string) {
  return jwt.sign(
    { sub: "admin-1", email: "admin@clinic.com", role: "ADMIN", clinicId },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
}

function buildAuthApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);
  app.use("/auth", createAuthRouter());
  app.use(errorHandler);
  return app;
}

function buildNotificationApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);
  app.use("/notifications", notificationRouter);
  app.use(errorHandler);
  return app;
}

function buildCryptoApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);
  app.use("/crypto", createCryptoRouter());
  app.use(errorHandler);
  return app;
}

describe("clinicId from body is ignored", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("ignores clinicId from body and uses token clinicId", async () => {
      const app = buildAuthApp();
      (prisma.users.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValueOnce("hashed");
      (prisma.users.create as jest.Mock).mockResolvedValueOnce({
        id: "new-user-1",
        email: "new@clinic-a.com",
        role: "MEMBER",
        clinic_id: "clinic-a",
      });

      const res = await request(app)
        .post("/auth/register")
        .set("Cookie", [`access_token=${adminTokenFor("clinic-a")}`])
        .send({
          email: "new@clinic-a.com",
          password: "StrongP@ss1",
          role: "MEMBER",
          clinicId: "clinic-b",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.clinicId).toBe("clinic-a");
      expect(
        (prisma.users.create as jest.Mock).mock.calls[0][0].data.clinic_id,
      ).toBe("clinic-a");
    });

    it("rejects registration without authenticated clinic context", async () => {
      const app = buildAuthApp();
      const res = await request(app).post("/auth/register").send({
        email: "new@clinic-a.com",
        password: "StrongP@ss1",
        role: "MEMBER",
      });

      expect(res.status).toBe(403);
    });
  });

  describe("CryptoConfigControllerService.manageOfflineWallet", () => {
    it("ignores body clinicId and uses token clinicId", async () => {
      (prisma.crypto_offline_wallets.create as jest.Mock).mockResolvedValueOnce({
        id: "wallet-1",
        address: "0xabc",
        clinic_id: "clinic-a",
        currency: "BTC",
        network: "MAINNET",
        label: null,
      });

      const service = new CryptoConfigControllerService();
      await service.manageOfflineWallet(
        {
          action: "create",
          address: "0xabc",
          currency: "btc",
          network: "mainnet",
          label: "Test",
          clinicId: "clinic-b",
        } as never,
        "clinic-a",
      );

      expect(
        (prisma.crypto_offline_wallets.create as jest.Mock).mock.calls[0][0].data
          .clinic_id,
      ).toBe("clinic-a");
    });

    it("rejects offline wallet creation without authenticated clinic context", async () => {
      const service = new CryptoConfigControllerService();
      await expect(
        service.manageOfflineWallet(
          {
            action: "create",
            address: "0xabc",
            currency: "btc",
            network: "mainnet",
          },
          undefined,
        ),
      ).rejects.toThrow("clinicId is required");
    });
  });

  describe("POST /notifications/create", () => {
    it("ignores body clinic_id and uses token clinicId", async () => {
      const app = buildNotificationApp();
      (prisma.notifications.create as jest.Mock).mockResolvedValueOnce({
        id: "notif-1",
        clinic_id: "clinic-a",
        tipo: "TEST",
        titulo: "Test",
        mensagem: "Test",
      });

      const res = await request(app)
        .post("/notifications/create")
        .set("Cookie", [`access_token=${adminTokenFor("clinic-a")}`])
        .send({
          tipo: "TEST",
          titulo: "Test",
          mensagem: "Test",
          clinic_id: "clinic-b",
        });

      expect(res.status).toBe(200);
      expect(
        (prisma.notifications.create as jest.Mock).mock.calls[0][0].data
          .clinic_id,
      ).toBe("clinic-a");
    });

    it("rejects notification creation without authenticated clinic context", async () => {
      const app = buildNotificationApp();
      const res = await request(app).post("/notifications/create").send({
        tipo: "TEST",
        titulo: "Test",
        mensagem: "Test",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /crypto/invoice", () => {
    it("ignores body clinicId and uses token clinicId", async () => {
      const app = buildCryptoApp();
      (prisma.crypto_transactions.create as jest.Mock).mockResolvedValueOnce({
        id: "invoice-1",
        clinic_id: "clinic-a",
        amount: 100,
        coin: "BTC",
        status: "PENDENTE",
        type: "INVOICE",
      });

      const res = await request(app)
        .post("/crypto/invoice")
        .set("Cookie", [`access_token=${adminTokenFor("clinic-a")}`])
        .send({
          amount: 100,
          currency: "btc",
          clinicId: "clinic-b",
        });

      expect(res.status).toBe(201);
      expect(
        (prisma.crypto_transactions.create as jest.Mock).mock.calls[0][0].data
          .clinic_id,
      ).toBe("clinic-a");
    });
  });
});
