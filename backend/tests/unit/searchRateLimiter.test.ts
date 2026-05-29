import { Request, Response } from "express";
import { searchRateLimiter } from "../../src/modules/search_index/api/rateLimiter";
import { redisInstance } from "../../src/infrastructure/redis/redisClient";
import { logger } from "../../src/infrastructure/logger";

jest.mock("../../src/infrastructure/redis/redisClient", () => ({
  redisInstance: {
    pipeline: jest.fn().mockReturnThis(),
    incr: jest.fn().mockReturnThis(),
    ttl: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  },
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("searchRateLimiter", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let setHeaderMock: jest.Mock;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    setHeaderMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();

    req = {
      user: { clinicId: "clinic-123", id: "user-1", role: "MEMBER" },
    };

    res = {
      setHeader: setHeaderMock,
      status: statusMock,
      json: jsonMock,
    };

    next = jest.fn();

    // Reset VIP env var
    delete process.env.SEARCH_RATE_LIMIT_VIP_CLINIC_IDS;
  });

  const mockPipelineExec = (
    count: number,
    ttl: number,
    error?: Error | null,
  ) => {
    const pipeline = redisInstance.pipeline();
    (pipeline.exec as jest.Mock).mockResolvedValue(
      error
        ? [
            [error, null],
            [error, null],
          ]
        : [
            [null, count],
            [null, ttl],
          ],
    );
  };

  it("should allow request when count is within default limit", async () => {
    mockPipelineExec(5, 45);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Limit", 30);
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Remaining", 25);
  });

  it("should set Redis TTL on first request", async () => {
    mockPipelineExec(1, -1);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(redisInstance.expire).toHaveBeenCalledWith(
      "ratelimit:search:clinic-123",
      60,
    );
    expect(next).toHaveBeenCalled();
  });

  it("should not set TTL when TTL is already positive", async () => {
    mockPipelineExec(2, 55);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(redisInstance.expire).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 429 when limit exceeded", async () => {
    mockPipelineExec(31, 42);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(429);
    expect(setHeaderMock).toHaveBeenCalledWith("Retry-After", 42);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Too many search requests. Please try again later.",
      retryAfter: 42,
    });
  });

  it("should use Retry-After default window when TTL is -1", async () => {
    mockPipelineExec(31, -1);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(setHeaderMock).toHaveBeenCalledWith("Retry-After", 60);
  });

  it("should fail open when Redis throws an error", async () => {
    const pipeline = redisInstance.pipeline();
    (pipeline.exec as jest.Mock).mockRejectedValue(
      new Error("Redis connection lost"),
    );

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Redis rate limiter error for clinic clinic-123"),
    );
  });

  it("should return 403 when clinicId is missing", async () => {
    req.user = { id: "user-1", role: "MEMBER" };

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Missing clinic context" });
  });

  it("should allow higher limit for VIP clinics", async () => {
    process.env.SEARCH_RATE_LIMIT_VIP_CLINIC_IDS = "clinic-123";
    // Re-import to pick up env var — not needed because resolveLimit runs at request time
    mockPipelineExec(95, 30);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Limit", 100);
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Remaining", 5);
  });

  it("should reject VIP clinic when exceeding VIP limit", async () => {
    process.env.SEARCH_RATE_LIMIT_VIP_CLINIC_IDS = "clinic-123";
    mockPipelineExec(101, 25);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(429);
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Limit", 100);
  });

  it("should support multiple VIP clinic IDs from env", async () => {
    process.env.SEARCH_RATE_LIMIT_VIP_CLINIC_IDS =
      "clinic-a, clinic-123, clinic-b";
    mockPipelineExec(50, 40);

    await searchRateLimiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(setHeaderMock).toHaveBeenCalledWith("X-RateLimit-Limit", 100);
  });
});
