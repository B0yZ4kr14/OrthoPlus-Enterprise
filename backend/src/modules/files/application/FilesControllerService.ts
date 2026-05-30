import fs from "fs";
import path from "path";
import { IFilesRepository } from "@/modules/files/domain/repositories/IFilesRepository";
import { FilesRepository } from "@/modules/files/infrastructure/FilesRepository";
import {
  FilesService,
  parseVisibilidade,
} from "@/modules/files/application/services/FilesService";
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector";
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics";
import { logger } from "@/infrastructure/logger";
import { Errors, ApiError, ErrorCodes } from "@/middleware/errorHandler";
import { MetricsEmitter } from "@/infrastructure/metrics";

const metricsCollector = getMetricsCollector(prometheusMetrics.getRegistry());

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

function enforceVisibilityAcl(
  file: { visibilidade: string },
  userRole: string | undefined,
): void {
  if (userRole === "ADMIN") return;
  if (userRole === "PATIENT" && file.visibilidade !== "PUBLICO") {
    throw Errors.forbidden("Patients can only access PUBLICO files");
  }
  if (userRole === "MEMBER" && file.visibilidade === "CONFIDENCIAL") {
    throw Errors.forbidden("MEMBER users cannot access CONFIDENCIAL files");
  }
}

function sanitizeUploadVisibility(
  visibilidade: string | undefined,
  userRole: string | undefined,
): string {
  if (userRole === "PATIENT") return "PUBLICO";
  if (userRole === "MEMBER") {
    if (visibilidade === "CONFIDENCIAL") return "RESTRITO";
    return visibilidade ?? "RESTRITO";
  }
  return visibilidade ?? "RESTRITO";
}

export class FilesControllerService {
  private filesService = new FilesService();
  private repo: IFilesRepository = new FilesRepository();

  async uploadFile(params: {
    file: Express.Multer.File;
    clinicId: string;
    userId: string;
    userRole: string | undefined;
    body: any;
    ip?: string;
    userAgent?: string;
  }) {
    const { file, clinicId, userId, userRole, body, ip, userAgent } = params;

    let visibilidade = sanitizeUploadVisibility(
      body.visibilidade as string | undefined,
      userRole,
    );

    const scanResult = await this.filesService.scanFileHash(file.path);
    if (scanResult.status === "BLOCKED") {
      fs.unlinkSync(file.path);
      throw Errors.validation(`Upload blocked: ${scanResult.reason}`);
    }
    if (scanResult.status === "SUSPICIOUS") {
      logger.warn("[FilesService] Suspicious file upload detected", {
        fileName: file.originalname,
        hash: scanResult.hash,
        reason: scanResult.reason,
      });
    }

    if (body.pacienteId && visibilidade) {
      const parsedVis = parseVisibilidade(visibilidade);
      if (parsedVis) {
        const inheritedVis =
          await this.filesService.inheritPermissionFromPatient(
            body.pacienteId,
            parsedVis,
            clinicId,
          );
        visibilidade = inheritedVis.toString();
      }
    }

    const startTime = Date.now();
    const fileRecord = await this.filesService.create({
      clinicId,
      pacienteId: body.pacienteId,
      consultaId: body.consultaId,
      orcamentoId: body.orcamentoId,
      nomeOriginal: file.originalname,
      nomeStorage: file.filename,
      mimeType: file.mimetype,
      tamanhoBytes: file.size,
      categoria: body.categoria ?? "OUTRO",
      visibilidade: visibilidade as string | undefined,
      uploadedBy: userId,
    });
    metricsCollector.files.recordUpload(
      clinicId,
      fileRecord.categoria,
      Date.now() - startTime,
    );

    MetricsEmitter.incrementCounter("files_uploaded", "Files uploaded", {
      clinicId,
      categoria: fileRecord.categoria,
    });

    this.repo
      .createAuditLog({
        action: "FILE_UPLOAD",
        action_type: "create",
        clinic_id: clinicId,
        user_id: userId,
        details: {
          fileId: fileRecord.id,
          fileName: fileRecord.nomeOriginal,
          categoria: fileRecord.categoria,
        },
        ip_address: ip ? { ip } : {},
        user_agent: userAgent ?? null,
      })
      .catch((err) =>
        logger.warn("[FilesService] Audit log failed (non-blocking):", err),
      );

    return fileRecord;
  }

  async listFiles(
    clinicId: string,
    userRole: "ADMIN" | "MEMBER" | "PATIENT" | undefined,
    query: any,
  ) {
    return this.filesService.list({
      clinicId,
      userRole,
      pacienteId: query.pacienteId,
      consultaId: query.consultaId,
      orcamentoId: query.orcamentoId,
      categoria: query.categoria,
      visibilidade: query.visibilidade,
    });
  }

  async getFile(
    id: string,
    clinicId: string,
    userRole: string | undefined,
    meta: { ip?: string; userAgent?: string; userId?: string },
  ) {
    const file = await this.filesService.getById(id, clinicId);
    if (!file) throw Errors.notFound("File", id);
    enforceVisibilityAcl(file, userRole);

    const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
    const filePath = path.join(uploadDir, file.nomeStorage);
    const exists = fs.existsSync(filePath);

    this.repo
      .createAuditLog({
        action: "FILE_VIEW",
        action_type: "read",
        clinic_id: clinicId,
        user_id: meta.userId,
        details: { fileId: id, fileName: file.nomeOriginal },
        ip_address: meta.ip ? { ip: meta.ip } : {},
        user_agent: meta.userAgent ?? null,
      })
      .catch((err) =>
        logger.warn("[FilesService] Audit log failed (non-blocking):", err),
      );

    return { file, existsOnDisk: exists, storagePath: file.nomeStorage };
  }

  async downloadFile(
    id: string,
    clinicId: string,
    userRole: string | undefined,
    meta: { ip?: string; userAgent?: string; userId?: string },
  ) {
    const startTime = Date.now();
    const file = await this.filesService.getById(id, clinicId);
    if (!file) throw Errors.notFound("File", id);
    enforceVisibilityAcl(file, userRole);

    const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
    const filePath = path.join(uploadDir, file.nomeStorage);
    if (!fs.existsSync(filePath)) throw Errors.notFound("File on disk", id);

    this.repo
      .createAuditLog({
        action: "FILE_DOWNLOAD",
        action_type: "read",
        clinic_id: clinicId,
        user_id: meta.userId,
        details: { fileId: id, fileName: file.nomeOriginal },
        ip_address: meta.ip ? { ip: meta.ip } : {},
        user_agent: meta.userAgent ?? null,
      })
      .catch((err) =>
        logger.warn("[FilesService] Audit log failed (non-blocking):", err),
      );

    metricsCollector.files.recordDownload(clinicId, Date.now() - startTime);

    return { file, filePath };
  }

  async deleteFile(
    id: string,
    clinicId: string,
    meta: { ip?: string; userAgent?: string; userId?: string },
  ) {
    const file = await this.filesService.getById(id, clinicId);
    if (!file) throw Errors.notFound("File", id);

    const uploadDir = process.env.UPLOAD_DIR ?? "uploads";
    const filePath = path.join(uploadDir, file.nomeStorage);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const deleted = await this.filesService.delete(id, clinicId);
    if (!deleted) throw Errors.internal("Failed to delete file record");

    metricsCollector.files.recordDelete(clinicId);
    MetricsEmitter.incrementCounter("files_deleted", "Files deleted", {
      clinicId,
      categoria: file.categoria,
    });

    this.repo
      .createAuditLog({
        action: "FILE_DELETE",
        action_type: "delete",
        clinic_id: clinicId,
        user_id: meta.userId,
        details: { fileId: id, fileName: file.nomeOriginal },
        ip_address: meta.ip ? { ip: meta.ip } : {},
        user_agent: meta.userAgent ?? null,
      })
      .catch((err) =>
        logger.warn("[FilesService] Audit log failed (non-blocking):", err),
      );

    return true;
  }

  async uploadBackupToCloud(
    backupId: string,
    provider: string,
    config: any,
    clinicId: string,
  ) {
    const backup = await this.repo.findBackupById(backupId);
    if (!backup) throw Errors.notFound("Backup", backupId);
    if (backup.clinic_id !== clinicId) {
      throw Errors.forbidden("Backup does not belong to this clinic");
    }

    const dataToUpload = JSON.stringify(backup.metadata);
    const fileName = `orthoplus_backup_${backup.clinic_id}_${new Date().toISOString().replace(/:/g, "-")}.json`;

    let uploadUrl: string;
    switch (provider) {
      case "s3":
        uploadUrl = await this.uploadToS3(
          dataToUpload,
          fileName,
          config as S3Config,
        );
        break;
      case "google_drive":
        uploadUrl = await this.uploadToGoogleDrive(
          dataToUpload,
          fileName,
          config as GoogleDriveConfig,
        );
        break;
      case "dropbox":
        uploadUrl = await this.uploadToDropbox(
          dataToUpload,
          fileName,
          config as DropboxConfig,
        );
        break;
      default:
        throw new ApiError(
          400,
          ErrorCodes.VALIDATION_ERROR,
          "Unsupported provider",
          "Provider must be one of: s3, google_drive, dropbox",
        );
    }

    await this.repo.updateBackup(backupId, {
      file_path: uploadUrl,
      metadata: {
        ...(typeof backup.metadata === "object" && backup.metadata !== null
          ? backup.metadata
          : {}),
        cloudProvider: provider,
        uploadedAt: new Date().toISOString(),
      },
    });

    return { uploadUrl, provider };
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
      headers: { "Content-Type": "application/json", "x-amz-date": date },
      body: dataBuffer,
    });

    if (!response.ok) throw Errors.externalService("S3");
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

    if (!tokenResponse.ok) throw Errors.externalService("Google Drive");

    const { access_token } = (await tokenResponse.json()) as {
      access_token: string;
    };

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
        headers: { Authorization: `Bearer ${access_token}` },
        body: form,
      },
    );

    if (!uploadResponse.ok) throw Errors.externalService("Google Drive");

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

    if (!response.ok) throw Errors.externalService("Dropbox");

    const result = (await response.json()) as { path_display: string };
    return result.path_display;
  }

  async triggerOCR(id: string, clinicId: string) {
    return this.filesService.extractOCR(id, clinicId);
  }

  async getOCRResult(id: string, clinicId: string) {
    return this.filesService.getOCRResult(id, clinicId);
  }

  async searchFilesByText(clinicId: string, query: string) {
    return this.filesService.searchFilesByText(clinicId, query);
  }

  async createVersion(
    fileId: string,
    clinicId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    return this.filesService.createVersion(
      fileId,
      {
        nomeStorage: file.filename,
        tamanhoBytes: file.size,
        createdBy: userId,
      },
      clinicId,
    );
  }

  async listVersions(fileId: string, clinicId: string) {
    return this.filesService.listVersions(fileId, clinicId);
  }

  async restoreVersion(fileId: string, versionId: string, clinicId: string) {
    return this.filesService.restoreVersion(fileId, versionId, clinicId);
  }
}
