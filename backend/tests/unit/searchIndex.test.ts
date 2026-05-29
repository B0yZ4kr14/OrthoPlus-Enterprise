import { PacienteIndexer } from "../../src/modules/search_index/services/PacienteIndexer";
import {
  BaseIndexer,
  SearchIndexEntry,
} from "../../src/modules/search_index/services/BaseIndexer";
import { SearchIndexPatientHandler } from "../../src/modules/search_index/events/handlers/SearchIndexPatientHandler";
import { PatientCreatedEvent } from "../../src/modules/pacientes/domain/events/PatientCreatedEvent";
import { PatientUpdatedEvent } from "../../src/modules/pacientes/domain/events/PatientUpdatedEvent";
import { PatientDeletedEvent } from "../../src/modules/pacientes/domain/events/PatientDeletedEvent";
import { prisma } from "../../src/infrastructure/database/prismaClient";
import { logger } from "../../src/infrastructure/logger";

jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
    search_index: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
    patients: {
      findUnique: jest.fn(),
    },
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

// Concrete indexer for testing BaseIndexer
class TestIndexer extends BaseIndexer<{ id: string; name: string }> {
  protected entityType = "test";
  protected module = "test-module";
  private items: { id: string; name: string }[] = [];
  private testBatchSize = 2;
  public queryBatchCalls: Array<{ cursor?: string; since?: Date }> = [];

  setItems(items: { id: string; name: string }[], batchSize = 2) {
    this.items = items;
    this.testBatchSize = batchSize;
  }

  protected async queryBatch(
    cursor?: string,
    since?: Date,
  ): Promise<{ id: string; name: string }[]> {
    this.queryBatchCalls.push({ cursor, since });
    const startIndex = cursor ? this.items.findIndex((i) => i.id > cursor) : 0;
    if (startIndex === -1 || startIndex >= this.items.length) return [];
    return this.items.slice(startIndex, startIndex + this.testBatchSize);
  }

  protected extractData(entity: { id: string; name: string }) {
    return entity;
  }

  protected buildIndexEntry(entity: {
    id: string;
    name: string;
  }): SearchIndexEntry {
    return {
      entity_type: this.entityType,
      entity_id: entity.id,
      clinic_id: "clinic-1",
      title: entity.name,
      content: entity.name,
      module: this.module,
    };
  }

  protected getEntityId(entity: { id: string; name: string }): string {
    return entity.id;
  }
}

describe("PacienteIndexer", () => {
  let indexer: PacienteIndexer;

  beforeEach(() => {
    indexer = new PacienteIndexer(prisma as any);
    jest.clearAllMocks();
  });

  describe("fullReindex", () => {
    it("should delete existing entries and create new ones", async () => {
      const mockPatients = [
        {
          id: "p1",
          clinic_id: "c1",
          full_name: "Joao",
          cpf: "123",
          email: "j@example.com",
          phone_primary: "111",
          phone_secondary: null,
          phone_emergency: null,
          clinical_observations: null,
        },
        {
          id: "p2",
          clinic_id: "c1",
          full_name: "Maria",
          cpf: "456",
          email: null,
          phone_primary: null,
          phone_secondary: null,
          phone_emergency: null,
          clinical_observations: null,
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce(mockPatients)
        .mockResolvedValueOnce([]);

      const result = await indexer.fullReindex();

      expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
        where: { entity_type: "paciente" },
      });
      expect(prisma.search_index.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({
            entity_type: "paciente",
            entity_id: "p1",
            clinic_id: "c1",
            title: "Joao",
            content: "Joao 123 j@example.com 111",
            module: "pacientes",
          }),
          expect.objectContaining({
            entity_type: "paciente",
            entity_id: "p2",
            clinic_id: "c1",
            title: "Maria",
            content: "Maria 456",
            module: "pacientes",
          }),
        ]),
      });
      expect(result.indexed).toBe(2);
    });
  });

  describe("incremental", () => {
    it("should only process patients updated after since", async () => {
      const since = new Date("2024-01-01T00:00:00Z");
      const mockPatients = [
        {
          id: "p1",
          clinic_id: "c1",
          full_name: "Joao",
          cpf: null,
          email: null,
          phone_primary: null,
          phone_secondary: null,
          phone_emergency: null,
          clinical_observations: null,
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce(mockPatients)
        .mockResolvedValueOnce([]);

      const result = await indexer.incremental(since);

      expect(prisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining(since.toISOString()),
      );
      expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
        where: {
          entity_type: "paciente",
          entity_id: { in: ["p1"] },
        },
      });
      expect(prisma.search_index.createMany).toHaveBeenCalled();
      expect(result.indexed).toBe(1);
    });
  });

  describe("toEntry", () => {
    it("should correctly concatenate searchable fields into content", async () => {
      const mockPatients = [
        {
          id: "p1",
          clinic_id: "c1",
          full_name: "Joao Silva",
          cpf: "123456",
          email: "joao@test.com",
          phone_primary: "11999999999",
          phone_secondary: "11888888888",
          phone_emergency: "11777777777",
          clinical_observations: "Alergia a penicilina",
        },
      ];

      (prisma.$queryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce(mockPatients)
        .mockResolvedValueOnce([]);

      await indexer.fullReindex();

      const createManyCall = (prisma.search_index.createMany as jest.Mock).mock
        .calls[0][0];
      expect(createManyCall.data[0].content).toBe(
        "Joao Silva 123456 joao@test.com 11999999999 11888888888 11777777777 Alergia a penicilina",
      );
    });

    it("should handle empty patient table gracefully", async () => {
      (prisma.$queryRawUnsafe as jest.Mock).mockResolvedValue([]);

      const result = await indexer.fullReindex();

      expect(result.indexed).toBe(0);
      expect(prisma.search_index.createMany).not.toHaveBeenCalled();
    });
  });
});

describe("BaseIndexer", () => {
  let indexer: TestIndexer;

  beforeEach(() => {
    indexer = new TestIndexer(prisma as any);
    jest.clearAllMocks();
  });

  describe("fullReindex", () => {
    it("should call processBatch with correct batches", async () => {
      indexer.setItems([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
      ]);

      await indexer.fullReindex();

      expect(prisma.search_index.createMany).toHaveBeenCalledTimes(2);
      expect(prisma.search_index.createMany).toHaveBeenNthCalledWith(1, {
        data: [
          expect.objectContaining({ entity_id: "1" }),
          expect.objectContaining({ entity_id: "2" }),
        ],
      });
      expect(prisma.search_index.createMany).toHaveBeenNthCalledWith(2, {
        data: [expect.objectContaining({ entity_id: "3" })],
      });
    });
  });

  describe("incremental", () => {
    it("should use since parameter correctly", async () => {
      const since = new Date("2024-01-01");
      indexer.setItems([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      await indexer.incremental(since);

      expect(indexer.queryBatchCalls[0]).toEqual({ cursor: undefined, since });
      expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
        where: {
          entity_type: "test",
          entity_id: { in: ["1", "2"] },
        },
      });
      expect(prisma.search_index.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ entity_id: "1" }),
          expect.objectContaining({ entity_id: "2" }),
        ]),
      });
    });
  });

  describe("batch size", () => {
    it("should handle batch size correctly", async () => {
      // batchSize is 2, so with 5 items we expect 3 createMany calls (2+2+1)
      indexer.setItems([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
        { id: "3", name: "Item 3" },
        { id: "4", name: "Item 4" },
        { id: "5", name: "Item 5" },
      ]);

      await indexer.fullReindex();

      expect(prisma.search_index.createMany).toHaveBeenCalledTimes(3);
    });
  });
});

describe("SearchIndexPatientHandler", () => {
  let handler: SearchIndexPatientHandler;

  beforeEach(() => {
    handler = new SearchIndexPatientHandler();
    jest.clearAllMocks();
  });

  it("should create search_index entry on PatientCreatedEvent", async () => {
    const patient = {
      id: "p1",
      clinic_id: "c1",
      full_name: "Joao Silva",
      cpf: "123",
      email: "joao@test.com",
      phone_primary: "111",
      phone_secondary: null,
      phone_emergency: null,
      clinical_observations: null,
    };

    (prisma.patients.findUnique as jest.Mock).mockResolvedValue(patient);

    const event = new PatientCreatedEvent("p1", "c1");
    await handler.handle(event);

    expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
      where: {
        entity_type: "paciente",
        entity_id: "p1",
      },
    });
    expect(prisma.search_index.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        entity_type: "paciente",
        entity_id: "p1",
        clinic_id: "c1",
        title: "Joao Silva",
        content: "Joao Silva 123 joao@test.com 111",
        module: "pacientes",
      }),
    });
  });

  it("should update search_index entry on PatientUpdatedEvent", async () => {
    const patient = {
      id: "p1",
      clinic_id: "c1",
      full_name: "Joao Silva Atualizado",
      cpf: "123",
      email: "joao@test.com",
      phone_primary: "111",
      phone_secondary: null,
      phone_emergency: null,
      clinical_observations: null,
    };

    (prisma.patients.findUnique as jest.Mock).mockResolvedValue(patient);

    const event = new PatientUpdatedEvent("p1", "c1");
    await handler.handle(event);

    expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
      where: {
        entity_type: "paciente",
        entity_id: "p1",
      },
    });
    expect(prisma.search_index.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: "Joao Silva Atualizado",
        entity_id: "p1",
      }),
    });
  });

  it("should delete search_index entry on PatientDeletedEvent", async () => {
    const event = new PatientDeletedEvent("p1", "c1");
    await handler.handle(event);

    expect(prisma.search_index.deleteMany).toHaveBeenCalledWith({
      where: {
        entity_type: "paciente",
        entity_id: "p1",
      },
    });
    expect(prisma.search_index.create).not.toHaveBeenCalled();
  });

  it("should catch errors and not throw", async () => {
    (prisma.patients.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB error"),
    );

    const event = new PatientCreatedEvent("p1", "c1");

    await expect(handler.handle(event)).resolves.not.toThrow();

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("erro ao processar evento de paciente"),
      expect.any(Object),
    );
  });
});
