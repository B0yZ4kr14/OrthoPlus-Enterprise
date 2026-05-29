import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { ReportControllerService } from "@/modules/relatorios/application/ReportControllerService";

export class ReportController {
  private service = new ReportControllerService();

  exportClinicData = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      throw Errors.unauthorized("Unauthorized: Missing clinicId or userId");
    }

    const result = await this.service.exportClinicData(
      clinicId,
      userId,
      req.body,
    );
    res.status(200).json(result);
  });

  importClinicData = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    const userId = req.user?.id;

    if (!clinicId || !userId) {
      throw Errors.unauthorized("Unauthorized: Missing clinicId or userId");
    }

    const userProfile = await this.service["repo"].findProfileById(userId);
    if (userProfile?.role !== "ADMIN" && userProfile?.role !== "MANAGER") {
      throw Errors.forbidden("Forbidden: Admin access required");
    }

    const result = await this.service.importClinicData(
      clinicId,
      userId,
      req.body,
    );
    res.status(200).json(result);
  });

  createDocumentPdf = asyncHandler(async (_req: Request, res: Response) => {
    const result = this.service.createDocumentPdf();
    res.status(200).json(result);
  });
}
