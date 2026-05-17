import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { ApiError, Errors, ErrorCodes } from "@/middleware/errorHandler";
import { NextFunction, Request, Response } from "express";
import { FilesService } from "../application/services/FilesService";
import path from "path";
import fs from "fs";

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId?: string;
}

interface DropboxConfig {
  accessToken: string;
  folder?: string;
}

export class FilesController {
  private filesService = new FilesService();

  async uploadFile(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.file) {
        throw Errors.validation("No file provided");
      }

      const clinicId = req.user?.clinicId as string;
      const userId = req.user?.id as string;

      if (!clinicId || !userId) {
        throw Errors.unauthorized("Authentication required");
      }

      const { pacienteId, consultaId, orcamentoId, categoria, visibilidade } =
        req.body;

      const fileRecord = await this.filesService.create({
        clinicId,
        pacienteId,
        consultaId,
        orcamentoId,
        nomeOriginal: req.file.originalname,
        nomeStorage: req.file.filename,
        mimeType: req.file.mimetype,
        tamanhoBytes: req.file.size,
        categoria: categoria ?? "OUTRO",
        visibilidade: visibilidade ?? "RESTRITO",
        uploadedBy: userId,
      });

      res.status(201).json({
        success: true,
        data: fileRecord,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] uploadFile error:", { error });
      const apiError = Errors.internal("File upload failed");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  async listFiles(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const clinicId = req.user?.clinicId as string;

      if (!clinicId) {
        throw Errors.unauthorized("Authentication required");
      }

      const { pacienteId, consultaId, orcamentoId, categoria, visibilidade } =
        req.query;

      const files = await this.filesService.list({
        clinicId,
        pacienteId: pacienteId as string | undefined,
        consultaId: consultaId as string | undefined,
        orcamentoId: orcamentoId as string | undefined,
        categoria: categoria as string | undefined,
        visibilidade: visibilidade as string | undefined,
      });

      res.status(200).json({
        success: true,
        count: files.length,
        data: files,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] listFiles error:", { error });
      const apiError = Errors.internal("Failed to list files");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  async getFile(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const clinicId = req.user?.clinicId as string;
      const { id } = req.params;

      if (!clinicId) {
        throw Errors.unauthorized("Authentication required");
      }

      const file = await this.filesService.getById(id, clinicId);

      if (!file) {
        throw Errors.notFound("File", id);
      }

      const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
      const filePath = path.join(uploadDir, file.nomeStorage);
      const exists = fs.existsSync(filePath);

      res.status(200).json({
        success: true,
        data: {
          ...file,
          storagePath: file.nomeStorage,
          existsOnDisk: exists,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] getFile error:", { error });
      const apiError = Errors.internal("Failed to get file");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  async downloadFile(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const clinicId = req.user?.clinicId as string;
      const { id } = req.params;

      if (!clinicId) {
        throw Errors.unauthorized("Authentication required");
      }

      const file = await this.filesService.getById(id, clinicId);

      if (!file) {
        throw Errors.notFound("File", id);
      }

      const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
      const filePath = path.join(uploadDir, file.nomeStorage);

      if (!fs.existsSync(filePath)) {
        throw Errors.notFound("File on disk", id);
      }

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.nomeOriginal)}"`,
      );

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] downloadFile error:", { error });
      const apiError = Errors.internal("Failed to download file");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  async deleteFile(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const clinicId = req.user?.clinicId as string;
      const { id } = req.params;

      if (!clinicId) {
        throw Errors.unauthorized("Authentication required");
      }

      const file = await this.filesService.getById(id, clinicId);

      if (!file) {
        throw Errors.notFound("File", id);
      }

      const deleted = await this.filesService.delete(id, clinicId);

      if (!deleted) {
        throw Errors.internal("Failed to delete file record");
      }

      const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
      const filePath = path.join(uploadDir, file.nomeStorage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] deleteFile error:", { error });
      const apiError = Errors.internal("Failed to delete file");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  // Edge Function: upload-to-cloud (kept for backward compatibility)
  async uploadBackupToCloud(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const { backupId, provider, config } = req.body;

      if (!backupId || !provider || !config) {
        throw Errors.validation("Missing required fields: backupId, provider, config");
      }

      const backup = await prisma.backup_history.findUnique({
        where: { id: backupId },
      });

      if (!backup) {
        throw Errors.notFound("Backup", backupId);
      }

      const dataToUpload = JSON.stringify(backup.metadata);
      const fileName = `orthoplus_backup_${backup.clinic_id}_${new Date().toISOString().replace(/:/g, "-")}.json`;

      let uploadUrl: string;

      switch (provider) {
        case "s3":
          uploadUrl = await this.uploadToS3(dataToUpload, fileName, config as S3Config);
          break;
        case "google_drive":
          uploadUrl = await this.uploadToGoogleDrive(dataToUpload, fileName, config as GoogleDriveConfig);
          break;
        case "dropbox":
          uploadUrl = await this.uploadToDropbox(dataToUpload, fileName, config as DropboxConfig);
          break;
        default:
          throw new ApiError(400, ErrorCodes.VALIDATION_ERROR, "Unsupported provider", "Provider must be one of: s3, google_drive, dropbox");
      }

      await prisma.backup_history.update({
        where: { id: backupId },
        data: {
          file_path: uploadUrl,
          metadata: {
            ...(typeof backup.metadata === "object" && backup.metadata !== null
              ? backup.metadata
              : {}),
            cloudProvider: provider,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      res.status(200).json({
        success: true,
        uploadUrl,
        provider,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json(error.toProblemDetail(req.originalUrl));
        return;
      }
      logger.error("[FilesController] uploadBackupToCloud error", { error });
      const apiError = Errors.internal("Cloud upload failed");
      res.status(500).json(apiError.toProblemDetail(req.originalUrl));
    }
  }

  private async uploadToS3(
    data: string,
    fileName: string,
    config: S3Config,
  ): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${fileName}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-amz-date": date,
      },
      body: dataBuffer,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    return url;
  }

  private async uploadToGoogleDrive(
    data: string,
    fileName: string,
    config: GoogleDriveConfig,
  ): Promise<string> {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to refresh Google Drive token");
    }

    const { access_token } = (await tokenResponse.json()) as { access_token: string };

    const metadata = {
      name: fileName,
      parents: config.folderId ? [config.folderId] : [],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", new Blob([data], { type: "application/json" }));

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        body: form,
      },
    );

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to Google Drive");
    }

    const result = (await uploadResponse.json()) as { id: string };
    return `https://drive.google.com/file/d/${result.id}/view`;
  }

  private async uploadToDropbox(
    data: string,
    fileName: string,
    config: DropboxConfig,
  ): Promise<string> {
    const dropboxPath = config.folder
      ? `/${config.folder}/${fileName}`
      : `/${fileName}`;

    const response = await fetch(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: dropboxPath,
            mode: "add",
            autorename: true,
            mute: false,
          }),
          "Content-Type": "application/octet-stream",
        },
        body: data,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload to Dropbox");
    }

    const result = (await response.json()) as { path_display: string };
    return result.path_display;
  }
}
