jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    module_catalog: {
      findFirst: jest.fn(),
    },
    clinic_modules: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { ClinicModuleRepository } from "../../src/modules/configuracoes/infrastructure/ClinicModuleRepository";
import { prisma } from "../../src/infrastructure/database/prismaClient";

const mockedPrisma = prisma as unknown as {
  module_catalog: { findFirst: jest.Mock };
  clinic_modules: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    upsert: jest.Mock;
  };
};

describe("ClinicModuleRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("upserts module toggle per clinic using unique constraint", async () => {
    mockedPrisma.module_catalog.findFirst.mockResolvedValueOnce({
      id: 1,
      module_key: "AGENDA",
    });
    mockedPrisma.clinic_modules.upsert.mockResolvedValueOnce({
      id: 1,
      clinic_id: "clinic-1",
      module_catalog_id: 1,
      is_active: false,
    });

    const repo = new ClinicModuleRepository(prisma);
    await repo.toggle("clinic-1", "AGENDA", false);

    expect(mockedPrisma.clinic_modules.upsert).toHaveBeenCalledWith({
      where: {
        clinic_id_module_catalog_id: {
          clinic_id: "clinic-1",
          module_catalog_id: 1,
        },
      },
      update: { is_active: false },
      create: expect.objectContaining({
        clinic_id: "clinic-1",
        module_catalog_id: 1,
        is_active: false,
        subscribed_at: expect.any(String),
      }),
    });
  });

  it("lists modules by clinic including catalog relation", async () => {
    mockedPrisma.clinic_modules.findMany.mockResolvedValueOnce([
      {
        id: 1,
        clinic_id: "clinic-1",
        module_catalog_id: 1,
        is_active: false,
        module_catalog: { id: 1, module_key: "AGENDA" },
      },
    ]);

    const repo = new ClinicModuleRepository(prisma);
    const modules = await repo.listByClinic("clinic-1");

    expect(mockedPrisma.clinic_modules.findMany).toHaveBeenCalledWith({
      where: { clinic_id: "clinic-1" },
      include: { module_catalog: true },
    });
    expect(modules[0].module_catalog.module_key).toBe("AGENDA");
    expect(modules[0].is_active).toBe(false);
  });
});
