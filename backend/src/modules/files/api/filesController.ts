import { Request, Response } from "express";
import fs from "fs";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { FilesControllerService } from "@/modules/files/application/FilesControllerService";

const service = new FilesControllerService();

export class FilesController {
  uploadFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw Errors.validation("No file provided");
    const clinicId = req.user?.clinicId as string;
    const userId = req.user?.id as string;
    if (!clinicId || !userId)
      throw Errors.unauthorized("Authentication required");

    const fileRecord = await service.uploadFile({
      file: req.file,
      clinicId,
      userId,
      userRole: req.user?.role as string | undefined,
      body: req.body,
      ip: req.ip ?? undefined,
      userAgent: req.headers["user-agent"] as string | undefined,
    });
    res.status(201).json({ success: true, data: fileRecord });
  });

  listFiles = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const files = await service.listFiles(
      clinicId,
      req.user?.role as any,
      req.query,
    );
    res.status(200).json({ success: true, count: files.length, data: files });
  });

  getFile = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const { file, existsOnDisk, storagePath } = await service.getFile(
      req.params.id,
      clinicId,
      req.user?.role as string | undefined,
      {
        ip: req.ip ?? undefined,
        userAgent: req.headers["user-agent"] as string | undefined,
        userId: req.user?.id as string | undefined,
      },
    );
    res
      .status(200)
      .json({ success: true, data: { ...file, storagePath, existsOnDisk } });
  });

  downloadFile = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const { file, filePath } = await service.downloadFile(
      req.params.id,
      clinicId,
      req.user?.role as string | undefined,
      {
        ip: req.ip ?? undefined,
        userAgent: req.headers["user-agent"] as string | undefined,
        userId: req.user?.id as string | undefined,
      },
    );
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.nomeOriginal)}"`,
    );
    fs.createReadStream(filePath).pipe(res);
  });

  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    await service.deleteFile(req.params.id, clinicId, {
      ip: req.ip ?? undefined,
      userAgent: req.headers["user-agent"] as string | undefined,
      userId: req.user?.id as string | undefined,
    });
    res
      .status(200)
      .json({ success: true, message: "File deleted successfully" });
  });

  uploadBackupToCloud = asyncHandler(async (req: Request, res: Response) => {
    const { backupId, provider, config } = req.body;
    if (!backupId || !provider || !config)
      throw Errors.validation(
        "Missing required fields: backupId, provider, config",
      );
    const result = await service.uploadBackupToCloud(
      backupId,
      provider,
      config,
    );
    res.status(200).json({ success: true, ...result });
  });

  triggerOCR = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const ocrRecord = await service.triggerOCR(req.params.id, clinicId);
    res
      .status(202)
      .json({
        success: true,
        message: "OCR extraction started",
        data: ocrRecord,
      });
  });

  getOCRResult = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const ocrRecord = await service.getOCRResult(req.params.id, clinicId);
    if (!ocrRecord) {
      res
        .status(200)
        .json({
          success: true,
          data: null,
          message: "No OCR result found for this file",
        });
      return;
    }
    res.status(200).json({ success: true, data: ocrRecord });
  });

  searchFilesByText = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const query = req.query.query;
    if (!query || typeof query !== "string")
      throw Errors.validation("Search query is required");
    const files = await service.searchFilesByText(clinicId, query);
    res.status(200).json({ success: true, count: files.length, data: files });
  });

  createVersion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw Errors.validation("No file provided");
    const clinicId = req.user?.clinicId as string;
    const userId = req.user?.id as string;
    if (!clinicId || !userId)
      throw Errors.unauthorized("Authentication required");
    const version = await service.createVersion(
      req.params.id,
      clinicId,
      userId,
      req.file,
    );
    res.status(201).json({ success: true, data: version });
  });

  listVersions = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const versions = await service.listVersions(req.params.id, clinicId);
    res
      .status(200)
      .json({ success: true, count: versions.length, data: versions });
  });

  restoreVersion = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId as string;
    if (!clinicId) throw Errors.unauthorized("Authentication required");
    const file = await service.restoreVersion(
      req.params.id,
      req.params.versionId,
      clinicId,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Version restored successfully",
        data: file,
      });
  });
}
