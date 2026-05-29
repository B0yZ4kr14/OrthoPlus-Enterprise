import { Request, Response } from "express";
import { SearchIndexController } from "@/modules/search_index/api/controller";
import { prisma } from "@/infrastructure/database/prismaClient";
import { redisInstance } from "@/infrastructure/redis/redisClient";

jest.mock("@/infrastructure/database/prismaClient", () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

jest.mock("@/infrastructure/redis/redisClient", () => ({
  redisInstance: {
    ping: jest.fn(),
  },
}));

describe("SearchIndexController.health", () => {
  let controller: SearchIndexController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    controller = new SearchIndexController();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    setHeaderMock = jest.fn();
    res = {
      status: statusMock,
      json: jsonMock,
      setHeader: setHeaderMock,
    };
    req = {
      user: { clinicId: "clinic-123" },
    };
    jest.clearAllMocks();
  });

  it("should return healthy when all checks pass", async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([{ ping: 1 }])
      .mockResolvedValueOnce([{ count: 10n }])
      .mockResolvedValueOnce([
        { max_updated: new Date("2026-05-26T10:00:00Z") },
      ]);
    (redisInstance.ping as jest.Mock).mockResolvedValue("PONG");

    await (controller as any).health(
      req as Request,
      res as Response,
      jest.fn(),
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "healthy",
        module: "search_index",
        clinicId: "clinic-123",
        checks: expect.objectContaining({
          postgresql: expect.objectContaining({
            status: "ok",
            details: "10 indexed records",
          }),
          redis: expect.objectContaining({ status: "ok" }),
          indexRecency: expect.objectContaining({ status: "ok" }),
        }),
      }),
    );
  });

  it("should return degraded when PostgreSQL fails", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(
      new Error("PG connection refused"),
    );
    (redisInstance.ping as jest.Mock).mockResolvedValue("PONG");

    await (controller as any).health(
      req as Request,
      res as Response,
      jest.fn(),
    );

    expect(statusMock).toHaveBeenCalledWith(503);
    const response = jsonMock.mock.calls[0][0];
    expect(response.status).toBe("degraded");
    expect(response.checks.postgresql.status).toBe("error");
    expect(response.checks.redis.status).toBe("ok");
  });

  it("should return degraded when Redis fails", async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([{ ping: 1 }])
      .mockResolvedValueOnce([{ count: 5n }])
      .mockResolvedValueOnce([{ max_updated: null }]);
    (redisInstance.ping as jest.Mock).mockRejectedValue(
      new Error("Redis down"),
    );

    await (controller as any).health(
      req as Request,
      res as Response,
      jest.fn(),
    );

    expect(statusMock).toHaveBeenCalledWith(503);
    const response = jsonMock.mock.calls[0][0];
    expect(response.status).toBe("degraded");
    expect(response.checks.postgresql.status).toBe("ok");
    expect(response.checks.redis.status).toBe("error");
  });

  it("should handle zero indexed records gracefully", async () => {
    (prisma.$queryRaw as jest.Mock)
      .mockResolvedValueOnce([{ ping: 1 }])
      .mockResolvedValueOnce([{ count: 0n }])
      .mockResolvedValueOnce([{ max_updated: null }]);
    (redisInstance.ping as jest.Mock).mockResolvedValue("PONG");

    await (controller as any).health(
      req as Request,
      res as Response,
      jest.fn(),
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    const response = jsonMock.mock.calls[0][0];
    expect(response.checks.postgresql.details).toBe("0 indexed records");
    expect(response.checks.indexRecency.details).toBe("No indexed records");
  });
});
