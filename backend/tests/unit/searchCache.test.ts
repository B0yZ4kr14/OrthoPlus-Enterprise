/**
 * Unit tests for searchCache
 */

import {
  getSearchCache,
  setSearchCache,
  invalidateSearchCache,
} from "../../src/infrastructure/cache/searchCache";
import type { SearchResponse } from "@orthoplus/shared-types";
import { redisInstance } from "../../src/infrastructure/redis/redisClient";

jest.mock("../../src/infrastructure/redis/redisClient", () => ({
  redisInstance: {
    get: jest.fn(),
    set: jest.fn(),
    scan: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("../../src/infrastructure/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("searchCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSearchCache", () => {
    it("should return parsed cached data on hit", async () => {
      const mockData: SearchResponse = {
        total: 1,
        page: 1,
        limit: 20,
        results: [
          {
            id: "1",
            entityType: "paciente",
            entityId: "p1",
            title: "Joao Silva",
            snippet: "...",
            score: 1.0,
            module: "pacientes",
          },
        ],
      };
      (redisInstance.get as jest.Mock).mockResolvedValue(
        JSON.stringify(mockData),
      );

      const result = await getSearchCache(
        "clinic-1",
        "joao",
        "pacientes",
        1,
        20,
      );

      expect(result).toEqual(mockData);
      expect(redisInstance.get).toHaveBeenCalledWith(
        "search:clinic-1:joao:pacientes:1:20",
      );
    });

    it("should return null on cache miss", async () => {
      (redisInstance.get as jest.Mock).mockResolvedValue(null);

      const result = await getSearchCache("clinic-1", "joao", undefined, 1, 20);

      expect(result).toBeNull();
      expect(redisInstance.get).toHaveBeenCalledWith(
        "search:clinic-1:joao:__all__:1:20",
      );
    });

    it("should return null and not throw on Redis error", async () => {
      (redisInstance.get as jest.Mock).mockRejectedValue(
        new Error("Redis down"),
      );

      const result = await getSearchCache("clinic-1", "joao", undefined, 1, 20);

      expect(result).toBeNull();
    });
  });

  describe("setSearchCache", () => {
    it("should store serialized data with EX in seconds", async () => {
      (redisInstance.set as jest.Mock).mockResolvedValue("OK");

      const data: SearchResponse = {
        total: 0,
        page: 1,
        limit: 20,
        results: [],
      };
      await setSearchCache("clinic-1", "joao", undefined, 1, 20, data, 60000);

      expect(redisInstance.set).toHaveBeenCalledWith(
        "search:clinic-1:joao:__all__:1:20",
        JSON.stringify(data),
        "EX",
        60,
      );
    });

    it("should not throw on Redis error", async () => {
      (redisInstance.set as jest.Mock).mockRejectedValue(
        new Error("Redis down"),
      );

      const data: SearchResponse = {
        total: 0,
        page: 1,
        limit: 20,
        results: [],
      };
      await expect(
        setSearchCache("clinic-1", "joao", undefined, 1, 20, data, 60000),
      ).resolves.toBeUndefined();
    });
  });

  describe("invalidateSearchCache", () => {
    it("should delete all keys matching search:clinicId:*", async () => {
      (redisInstance.scan as jest.Mock).mockResolvedValueOnce([
        "0",
        ["search:clinic-1:joao:__all__:1:20"],
      ]);

      await invalidateSearchCache("clinic-1");

      expect(redisInstance.scan).toHaveBeenCalledWith(
        "0",
        "MATCH",
        "search:clinic-1:*",
        "COUNT",
        100,
      );
      expect(redisInstance.del).toHaveBeenCalledWith(
        "search:clinic-1:joao:__all__:1:20",
      );
    });

    it("should handle multiple scan iterations", async () => {
      (redisInstance.scan as jest.Mock)
        .mockResolvedValueOnce(["2", ["search:clinic-1:a"]])
        .mockResolvedValueOnce(["0", ["search:clinic-1:b"]]);

      await invalidateSearchCache("clinic-1");

      expect(redisInstance.scan).toHaveBeenCalledTimes(2);
      expect(redisInstance.del).toHaveBeenCalledTimes(2);
      expect(redisInstance.del).toHaveBeenNthCalledWith(1, "search:clinic-1:a");
      expect(redisInstance.del).toHaveBeenNthCalledWith(2, "search:clinic-1:b");
    });

    it("should not call del when no keys match", async () => {
      (redisInstance.scan as jest.Mock).mockResolvedValueOnce(["0", []]);

      await invalidateSearchCache("clinic-1");

      expect(redisInstance.del).not.toHaveBeenCalled();
    });

    it("should not throw on Redis error", async () => {
      (redisInstance.scan as jest.Mock).mockRejectedValue(
        new Error("Redis down"),
      );

      await expect(invalidateSearchCache("clinic-1")).resolves.toBeUndefined();
    });
  });
});
