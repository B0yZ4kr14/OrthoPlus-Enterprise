jest.mock("../../src/infrastructure/database/prismaClient", () => ({
  prisma: {
    marketing_campaigns: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
  },
}))

jest.mock("../../src/infrastructure/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}))

import { MarketingController } from "../../src/modules/marketing/api/controller"

describe("MarketingController debug", () => {
  test("prisma mock works", async () => {
    const controller = new MarketingController()
    const req: any = { user: { clinicId: "clinic-1" }, params: { id: "x" }, query: {}, body: {} }
    const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() }
    const next = jest.fn()
    
    await controller.getCampanhaById(req, res, next)
    
    expect(next).toHaveBeenCalled()
  })
})
