import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { CommControllerService } from "@/modules/comm/application/CommControllerService";

export class CommController {
  private service = new CommControllerService();

  generateVideoToken = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const result = await this.service.generateVideoToken(clinicId, req.body);
    res.json({ success: true, ...result });
  });

  agoraRecording = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const result = await this.service.agoraRecording(clinicId, req.body);
    res.json({ success: true, ...result });
  });
}
