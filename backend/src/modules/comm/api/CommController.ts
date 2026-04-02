import crypto from "crypto";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const GenerateVideoTokenSchema = z.object({
  teleconsultaId: z.string().uuid(),
});

const AgoraRecordingSchema = z.object({
  action: z.enum(["start", "stop"]),
  teleconsultaId: z.string().uuid(),
  channelName: z.string().min(1),
  uid: z.union([z.string(), z.number()]),
});

// ---------------------------------------------------------------------------
// Agora API response types
// ---------------------------------------------------------------------------

interface AcquireResourceResponse {
  resourceId: string;
}

interface StartRecordingResponse {
  sid: string;
}

interface StopRecordingResponse {
  serverResponse?: {
    fileList?: unknown[];
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface AgoraConfig {
  appId: string | undefined;
  appCertificate: string | undefined;
  customerId: string | undefined;
  customerSecret: string | undefined;
}

function getAgoraConfig(): AgoraConfig {
  const appId = process.env.AGORA_APP_ID;
  if (!appId) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'FATAL: AGORA_APP_ID environment variable is not set. ' +
        'Agora video/recording features will not work in production.',
      );
    }
    logger.warn(
      'AGORA_APP_ID is not set. Agora features will be unavailable. ' +
      'Set AGORA_APP_ID in your environment to enable video/recording.',
    );
  }
  return {
    appId,
    appCertificate: process.env.AGORA_APP_CERTIFICATE,
    customerId: process.env.AGORA_CUSTOMER_ID,
    customerSecret: process.env.AGORA_CUSTOMER_SECRET,
  };
}

function buildAgoraAuthHeader(
  customerId: string,
  customerSecret: string,
): string {
  return `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

export class CommController {
  /**
   * Port of generate-video-token Edge Function
   */
  async generateVideoToken(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }

      const parsed = GenerateVideoTokenSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.flatten() });
      }

      const { teleconsultaId } = parsed.data;

      // Scoped to clinic for multi-tenant isolation
      // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
      const teleconsultaRecord = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: teleconsultaId, clinic_id: clinicId },
      });

      if (!teleconsultaRecord) {
        return res.status(404).json({ error: "Teleconsulta not found" });
      }

      const { appId, appCertificate } = getAgoraConfig();
      const channelName = `teleconsulta-${teleconsultaId}`;
      // NOTE: crypto.randomInt is cryptographically secure; avoids Math.random() collisions
      const uid = crypto.randomInt(1, 100_000);
      const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour

      let token: string;

      if (appCertificate) {
        // In production, we must use the real Agora RTC SDK for token generation.
        // The agora-access-token package provides RtcTokenBuilder for this purpose.
        // For now, log a warning so operators know this feature is not fully configured.
        logger.warn(
          "Agora token generation is using a dev-stub. Install agora-access-token and implement real token generation for production use.",
        );
        token = `agora-stub-token-${Date.now()}`;
      } else {
        if (process.env.NODE_ENV === "production") {
          return res.status(503).json({
            error: "Video conferencing is not configured. Set AGORA_APP_CERTIFICATE.",
          });
        }
        token = `dev-token-${Date.now()}`;
      }

      // Use FRONTEND_URL for room link (falls back to BACKEND_URL for backwards compatibility)
      const frontendUrl =
        process.env.FRONTEND_URL ||
        process.env.BACKEND_URL ||
        "http://localhost:3000";
      const salaUrl = `${frontendUrl}/teleconsulta/sala/${teleconsultaId}`;

      // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
      await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: teleconsultaId },
        data: { link_sala: salaUrl },
      });

      // Log audit
      // TODO: replace (prisma as any) once Prisma schema exports audit_logs type
      await (prisma as any).audit_logs.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: {
          user_id: teleconsultaRecord.dentist_id,
          clinic_id: teleconsultaRecord.clinic_id,
          action: "TELECONSULTA_STARTED",
          details: {
            teleconsulta_id: teleconsultaId,
            channel_name: channelName,
          },
        },
      });

      return res.json({
        success: true,
        token,
        appId,
        channelName,
        uid,
        salaUrl,
        expirationTime,
      });
    } catch (error: unknown) {
      logger.error("Error generating video token:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Port of agora-recording Edge Function
   */
  async agoraRecording(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        return res.status(401).json({ error: "Missing clinic context" });
      }

      const parsed = AgoraRecordingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Invalid input", details: parsed.error.flatten() });
      }

      const { action, teleconsultaId, channelName, uid } = parsed.data;
      const { appId, customerId, customerSecret } = getAgoraConfig();

      logger.info("Agora Recording request:", {
        action,
        teleconsultaId,
        channelName,
      });

      if (action === "start") {
        // Start Cloud Recording
        if (!customerId || !customerSecret) {
          logger.info(
            "Agora credentials not configured, simulating recording start",
          );

          // TODO (dev-stub): replace with real Agora Cloud Recording API call
          const mockResourceId = `resource-${Date.now()}`;
          const mockSid = `sid-${Date.now()}`;

          // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
          await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
            where: { id: teleconsultaId },
            data: {
              recording_resource_id: mockResourceId,
              recording_sid: mockSid,
              recording_started_at: new Date(),
            },
          });

          return res.json({
            success: true,
            resourceId: mockResourceId,
            sid: mockSid,
            message: "Recording started (simulated)",
          });
        }

        // Step 1: Acquire resource
        const acquireUrl = `https://api.agora.io/v1/apps/${appId}/cloud_recording/acquire`;
        const acquireResponse = await fetch(acquireUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: buildAgoraAuthHeader(customerId, customerSecret),
          },
          body: JSON.stringify({
            cname: channelName,
            uid: uid.toString(),
            clientRequest: {
              resourceExpiredHour: 24,
            },
          }),
        });

        if (!acquireResponse.ok) {
          // Log internal details but do not expose Agora API response to callers
          logger.error("Agora acquire resource failed", {
            status: acquireResponse.status,
            body: await acquireResponse.text(),
          });
          throw new Error("Failed to acquire Agora recording resource");
        }

        const acquireResourceResponse =
          (await acquireResponse.json()) as AcquireResourceResponse;
        const resourceId = acquireResourceResponse.resourceId;

        // Step 2: Start recording
        const startUrl = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
        const startResponse = await fetch(startUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: buildAgoraAuthHeader(customerId, customerSecret),
          },
          body: JSON.stringify({
            cname: channelName,
            uid: uid.toString(),
            clientRequest: {
              recordingConfig: {
                maxIdleTime: 30,
                streamTypes: 2, // Audio + Video
                channelType: 0, // Communication profile
                videoStreamType: 0, // High stream
                subscribeAudioUids: ["#allstream#"],
                subscribeVideoUids: ["#allstream#"],
              },
              storageConfig: {
                vendor: 1, // Agora S3
                region: 0,
                bucket: "agora-recording",
                accessKey: customerId,
                secretKey: customerSecret,
                fileNamePrefix: [`teleconsulta-${teleconsultaId}`],
              },
            },
          }),
        });

        if (!startResponse.ok) {
          // Log internal details but do not expose Agora API response to callers
          logger.error("Agora start recording failed", {
            status: startResponse.status,
            body: await startResponse.text(),
          });
          throw new Error("Failed to start Agora cloud recording");
        }

        const startRecordingResponse =
          (await startResponse.json()) as StartRecordingResponse;
        const sid = startRecordingResponse.sid;

        // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
        await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: teleconsultaId },
          data: {
            recording_resource_id: resourceId,
            recording_sid: sid,
            recording_started_at: new Date(),
          },
        });

        logger.info("Recording started successfully:", { resourceId, sid });

        return res.json({
          success: true,
          resourceId,
          sid,
          message: "Recording started successfully",
        });
      } else if (action === "stop") {
        // Stop Cloud Recording — scoped to clinic for multi-tenant isolation
        // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
        const teleconsultaRecord = await (prisma as any).teleconsultas.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: teleconsultaId, clinic_id: clinicId },
          select: { recording_resource_id: true, recording_sid: true },
        });

        if (!teleconsultaRecord) {
          return res.status(404).json({ error: "Teleconsulta not found" });
        }

        const resourceId = teleconsultaRecord.recording_resource_id;
        const sid = teleconsultaRecord.recording_sid;

        if (!resourceId || !sid) {
          return res
            .status(400)
            .json({ error: "Recording not found for this teleconsulta" });
        }

        if (!customerId || !customerSecret) {
          logger.info(
            "Agora credentials not configured, simulating recording stop",
          );

          // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
          await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
            where: { id: teleconsultaId },
            data: {
              recording_stopped_at: new Date(),
            },
          });

          return res.json({
            success: true,
            message: "Recording stopped (simulated)",
          });
        }

        // Real Agora.io Cloud Recording stop
        const stopUrl = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
        const stopResponse = await fetch(stopUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: buildAgoraAuthHeader(customerId, customerSecret),
          },
          body: JSON.stringify({
            cname: channelName,
            uid: uid.toString(),
            clientRequest: {},
          }),
        });

        if (!stopResponse.ok) {
          // Log internal details but do not expose Agora API response to callers
          logger.error("Agora stop recording failed", {
            status: stopResponse.status,
            body: await stopResponse.text(),
          });
          throw new Error("Failed to stop Agora cloud recording");
        }

        const stopRecordingResponse =
          (await stopResponse.json()) as StopRecordingResponse;

        // TODO: replace (prisma as any) once Prisma schema exports teleconsultas type
        await (prisma as any).teleconsultas.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
          where: { id: teleconsultaId },
          data: {
            recording_stopped_at: new Date(),
            recording_file_list:
              stopRecordingResponse.serverResponse?.fileList || [],
          },
        });

        logger.info("Recording stopped successfully");

        return res.json({
          success: true,
          fileList: stopRecordingResponse.serverResponse?.fileList || [],
          message: "Recording stopped successfully",
        });
      }

      return res
        .status(400)
        .json({ error: 'Invalid action. Use "start" or "stop"' });
    } catch (error: unknown) {
      logger.error("Error in agoraRecording:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
