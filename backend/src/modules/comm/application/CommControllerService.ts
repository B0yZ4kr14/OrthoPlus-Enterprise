import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Errors } from "@/middleware/errorHandler";

const GenerateVideoTokenSchema = z.object({
  teleconsultaId: z.string().uuid(),
});

const AgoraRecordingSchema = z.object({
  action: z.enum(["start", "stop"]),
  teleconsultaId: z.string().uuid(),
  channelName: z.string().min(1),
  uid: z.union([z.string(), z.number()]),
});

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

interface AgoraConfig {
  appId: string | undefined;
  appCertificate: string | undefined;
  customerId: string | undefined;
  customerSecret: string | undefined;
}

function getAgoraConfig(): AgoraConfig {
  const appId = process.env.AGORA_APP_ID;
  if (!appId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: AGORA_APP_ID environment variable is not set. " +
          "Agora video/recording features will not work in production.",
      );
    }
    logger.warn(
      "AGORA_APP_ID is not set. Agora features will be unavailable. " +
        "Set AGORA_APP_ID in your environment to enable video/recording.",
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

export class CommControllerService {
  async generateVideoToken(clinicId: string, body: unknown) {
    const parsed = GenerateVideoTokenSchema.safeParse(body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const { teleconsultaId } = parsed.data;

    const teleconsultaRecord = await prisma.teleconsultas.findFirst({
      where: { id: teleconsultaId, clinic_id: clinicId },
    });

    if (!teleconsultaRecord) {
      throw Errors.notFound("Teleconsulta");
    }

    const { appId, appCertificate } = getAgoraConfig();
    const channelName = `teleconsulta-${teleconsultaId}`;
    const uid = crypto.randomInt(1, 100_000);
    const expirationTime = Math.floor(Date.now() / 1000) + 3600;

    let token: string;

    if (appCertificate) {
      logger.warn(
        "Agora token generation is using a dev-stub. Install agora-access-token and implement real token generation for production use.",
      );
      token = `agora-stub-token-${Date.now()}`;
    } else {
      if (process.env.NODE_ENV === "production") {
        throw Errors.externalService(
          "Video conferencing is not configured. Set AGORA_APP_CERTIFICATE.",
        );
      }
      token = `dev-token-${Date.now()}`;
    }

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:3000";
    const salaUrl = `${frontendUrl}/teleconsulta/sala/${teleconsultaId}`;

    await prisma.teleconsultas.update({
      where: { id: teleconsultaId },
      data: { link_sala: salaUrl },
    });

    await prisma.audit_logs.create({
      data: {
        user_id: teleconsultaRecord.dentist_id,
        clinic_id: teleconsultaRecord.clinic_id,
        action: "TELECONSULTA_STARTED",
        ip_address: null as any,
      } as any,
    });

    return {
      token,
      appId,
      channelName,
      uid,
      salaUrl,
      expirationTime,
    };
  }

  async agoraRecording(clinicId: string, body: unknown) {
    const parsed = AgoraRecordingSchema.safeParse(body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const { action, teleconsultaId, channelName, uid } = parsed.data;
    const { appId, customerId, customerSecret } = getAgoraConfig();

    logger.info("Agora Recording request:", {
      action,
      teleconsultaId,
      channelName,
    });

    if (action === "start") {
      if (!customerId || !customerSecret) {
        logger.info(
          "Agora credentials not configured, simulating recording start",
        );
        const mockResourceId = `resource-${Date.now()}`;
        const mockSid = `sid-${Date.now()}`;

        await prisma.teleconsultas.update({
          where: { id: teleconsultaId },
          data: {
            recording_url: `resource:${mockResourceId}|sid:${mockSid}`,
          } as any,
        });

        return {
          resourceId: mockResourceId,
          sid: mockSid,
          message: "Recording started (simulated)",
        };
      }

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
        logger.error("Agora acquire resource failed", {
          status: acquireResponse.status,
          body: await acquireResponse.text(),
        });
        throw Errors.externalService("Agora recording");
      }

      const acquireResourceResponse =
        (await acquireResponse.json()) as AcquireResourceResponse;
      const resourceId = acquireResourceResponse.resourceId;

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
              streamTypes: 2,
              channelType: 0,
              videoStreamType: 0,
              subscribeAudioUids: ["#allstream#"],
              subscribeVideoUids: ["#allstream#"],
            },
            storageConfig: {
              vendor: 1,
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
        logger.error("Agora start recording failed", {
          status: startResponse.status,
          body: await startResponse.text(),
        });
        throw Errors.externalService("Agora recording");
      }

      const startRecordingResponse =
        (await startResponse.json()) as StartRecordingResponse;
      const sid = startRecordingResponse.sid;

      await prisma.teleconsultas.update({
        where: { id: teleconsultaId },
        data: {
          recording_url: `resource:${resourceId}|sid:${sid}`,
        } as any,
      });

      logger.info("Recording started successfully:", { resourceId, sid });

      return {
        resourceId,
        sid,
        message: "Recording started successfully",
      };
    }

    if (action === "stop") {
      const teleconsultaRecord = await prisma.teleconsultas.findFirst({
        where: { id: teleconsultaId, clinic_id: clinicId },
        select: { recording_url: true },
      });

      if (!teleconsultaRecord) {
        throw Errors.notFound("Teleconsulta");
      }

      const resourceId = (teleconsultaRecord as any).recording_resource_id;
      const sid = (teleconsultaRecord as any).recording_sid;

      if (!resourceId || !sid) {
        throw Errors.validation("Recording not found for this teleconsulta");
      }

      if (!customerId || !customerSecret) {
        logger.info(
          "Agora credentials not configured, simulating recording stop",
        );

        await prisma.teleconsultas.update({
          where: { id: teleconsultaId },
          data: {
            status: "CONCLUIDA",
          } as any,
        });

        return {
          message: "Recording stopped (simulated)",
        };
      }

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
        logger.error("Agora stop recording failed", {
          status: stopResponse.status,
          body: await stopResponse.text(),
        });
        throw Errors.externalService("Agora recording");
      }

      const stopRecordingResponse =
        (await stopResponse.json()) as StopRecordingResponse;

      await prisma.teleconsultas.update({
        where: { id: teleconsultaId },
        data: {
          recording_url: `stopped|files:${JSON.stringify(stopRecordingResponse.serverResponse?.fileList || [])}`,
          status: "CONCLUIDA",
        } as any,
      });

      logger.info("Recording stopped successfully");

      return {
        fileList: stopRecordingResponse.serverResponse?.fileList || [],
        message: "Recording stopped successfully",
      };
    }

    throw Errors.validation('Invalid action. Use "start" or "stop"');
  }
}
