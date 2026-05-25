import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { AnalyticsControllerService } from "@/modules/analytics/application/AnalyticsControllerService";

export class AnalyticsController {
  private service = new AnalyticsControllerService();

  getDashboardOverview = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Unauthorized: Missing clinicId");
    }
    const result = await this.service.getDashboardOverview(clinicId);
    res.json(result);
  });

  getUnifiedMetrics = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Unauthorized");
    }
    const result = await this.service.getUnifiedMetrics(clinicId);
    res.json(result);
  });

  getMarketingROI = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Unauthorized");
    }
    const result = await this.service.getMarketingROI(clinicId);
    res.json(result);
  });

  processAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Unauthorized");
    }
    const result = await this.service.processAnalytics(clinicId, req.body);
    res.json(result);
  });

  getSidebarBadges = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Unauthorized: Missing clinicId");
    }
    const result = await this.service.getSidebarBadges(clinicId);
    res.json(result);
  });
}
