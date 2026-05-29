import { describe, it, expect } from "vitest";
import { BlockedTime, BlockedTimeProps } from "../BlockedTime";

function makeProps(overrides?: Partial<BlockedTimeProps>): BlockedTimeProps {
  return {
    id: "bt-1",
    clinicId: "clinic-1",
    dentistId: "dentist-1",
    startDatetime: new Date("2024-01-01T10:00:00Z"),
    endDatetime: new Date("2024-01-01T12:00:00Z"),
    reason: "Reunião",
    createdBy: "user-1",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("BlockedTime", () => {
  describe("constructor validation", () => {
    it("should create with valid props", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.id).toBe("bt-1");
    });

    it("should throw when clinicId is missing", () => {
      expect(() => new BlockedTime(makeProps({ clinicId: "" }))).toThrow(
        "ID da clínica é obrigatório",
      );
    });

    it("should throw when dentistId is missing", () => {
      expect(() => new BlockedTime(makeProps({ dentistId: "" }))).toThrow(
        "ID do dentista é obrigatório",
      );
    });

    it("should throw when startDatetime is missing", () => {
      expect(
        () =>
          new BlockedTime(
            makeProps({ startDatetime: undefined as unknown as Date }),
          ),
      ).toThrow("Data/hora de início é obrigatória");
    });

    it("should throw when endDatetime is missing", () => {
      expect(
        () =>
          new BlockedTime(
            makeProps({ endDatetime: undefined as unknown as Date }),
          ),
      ).toThrow("Data/hora de fim é obrigatória");
    });

    it("should throw when start is after end", () => {
      expect(
        () =>
          new BlockedTime(
            makeProps({
              startDatetime: new Date("2024-01-01T14:00:00Z"),
              endDatetime: new Date("2024-01-01T10:00:00Z"),
            }),
          ),
      ).toThrow("Data/hora de início deve ser antes da data/hora de fim");
    });

    it("should throw when start equals end", () => {
      const d = new Date("2024-01-01T10:00:00Z");
      expect(
        () => new BlockedTime(makeProps({ startDatetime: d, endDatetime: d })),
      ).toThrow("Data/hora de início deve ser antes da data/hora de fim");
    });

    it("should throw when reason is empty", () => {
      expect(() => new BlockedTime(makeProps({ reason: "" }))).toThrow(
        "Motivo do bloqueio é obrigatório",
      );
    });

    it("should throw when reason is whitespace only", () => {
      expect(() => new BlockedTime(makeProps({ reason: "   " }))).toThrow(
        "Motivo do bloqueio é obrigatório",
      );
    });

    it("should throw when createdBy is missing", () => {
      expect(() => new BlockedTime(makeProps({ createdBy: "" }))).toThrow(
        "Usuário criador é obrigatório",
      );
    });
  });

  describe("getters", () => {
    it("should return all property values", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.clinicId).toBe("clinic-1");
      expect(bt.dentistId).toBe("dentist-1");
      expect(bt.reason).toBe("Reunião");
      expect(bt.createdBy).toBe("user-1");
    });
  });

  describe("isActive", () => {
    it("should return true when checkDate is within range", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.isActive(new Date("2024-01-01T11:00:00Z"))).toBe(true);
    });

    it("should return false when checkDate is before range", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.isActive(new Date("2024-01-01T09:00:00Z"))).toBe(false);
    });

    it("should return false when checkDate is at or after end", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.isActive(new Date("2024-01-01T12:00:00Z"))).toBe(false);
      expect(bt.isActive(new Date("2024-01-01T13:00:00Z"))).toBe(false);
    });
  });

  describe("overlaps", () => {
    it("should return true when ranges overlap", () => {
      const bt = new BlockedTime(makeProps());
      expect(
        bt.overlaps(
          new Date("2024-01-01T11:00:00Z"),
          new Date("2024-01-01T13:00:00Z"),
        ),
      ).toBe(true);
    });

    it("should return false when ranges do not overlap", () => {
      const bt = new BlockedTime(makeProps());
      expect(
        bt.overlaps(
          new Date("2024-01-01T12:00:00Z"),
          new Date("2024-01-01T14:00:00Z"),
        ),
      ).toBe(false);
    });
  });

  describe("contains", () => {
    it("should return true when datetime is within range", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.contains(new Date("2024-01-01T11:00:00Z"))).toBe(true);
    });

    it("should return false when datetime is outside range", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.contains(new Date("2024-01-01T09:00:00Z"))).toBe(false);
    });
  });

  describe("getDurationMinutes", () => {
    it("should return correct duration in minutes", () => {
      const bt = new BlockedTime(makeProps());
      expect(bt.getDurationMinutes()).toBe(120);
    });

    it("should handle odd seconds by flooring", () => {
      const bt = new BlockedTime(
        makeProps({
          startDatetime: new Date("2024-01-01T10:00:00Z"),
          endDatetime: new Date("2024-01-01T10:30:45Z"),
        }),
      );
      expect(bt.getDurationMinutes()).toBe(30);
    });
  });

  describe("updateReason", () => {
    it("should update reason", () => {
      const bt = new BlockedTime(makeProps());
      bt.updateReason("Novo motivo");
      expect(bt.reason).toBe("Novo motivo");
    });

    it("should throw when new reason is empty", () => {
      const bt = new BlockedTime(makeProps());
      expect(() => bt.updateReason("")).toThrow("Motivo não pode ser vazio");
    });
  });

  describe("toJSON", () => {
    it("should return a copy of props", () => {
      const bt = new BlockedTime(makeProps());
      const json = bt.toJSON();
      expect(json.id).toBe("bt-1");
      expect(json).not.toBe(bt);
    });
  });
});
