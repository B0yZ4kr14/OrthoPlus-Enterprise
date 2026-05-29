import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { logger } from "@/infrastructure/logger";
import { NotificationControllerService } from "@/modules/notifications/application/NotificationControllerService";
import nodemailer from "nodemailer";

function createMailTransport() {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  });
}

const mailer = createMailTransport();

export class NotificationController {
  private service = new NotificationControllerService();

  listNotifications = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const notifications = await this.service.listNotifications(clinicId);
    res.json({ notifications });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    await this.service.markAsRead(id, clinicId);
    res.json({ success: true, id });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    await this.service.markAllAsRead(clinicId);
    res.json({ success: true });
  });

  runAutoNotifications = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.service.runAutoNotifications();
    res.json({ success: true, ...result });
  });

  createNotification = asyncHandler(async (req: Request, res: Response) => {
    const notif = await this.service.createNotification(req.body);
    res.json({ success: true, notification: notif });
  });

  checkVolatilityAlerts = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.service.checkVolatilityAlerts();
    res.json({ success: true, ...result });
  });

  checkCryptoPriceAlerts = asyncHandler(
    async (_req: Request, res: Response) => {
      const result = await this.service.checkCryptoPriceAlerts();
      res.json({ success: true, ...result });
    },
  );

  sendReplenishmentAlerts = asyncHandler(
    async (req: Request, res: Response) => {
      const { previsoes, resumo } = req.body;
      const clinic_id = req.user?.clinicId;
      const user_id = req.user?.id || null;

      if (!clinic_id) {
        throw Errors.unauthorized("Missing clinic context");
      }

      const result = await this.service.sendReplenishmentAlerts({
        previsoes,
        resumo,
      });

      const admins = await this.service["repo"].findAdminsByClinic(clinic_id);
      const adminEmails = admins.map((a: any) => a.email).filter(Boolean);

      if (adminEmails.length > 0) {
        const produtosCriticos = previsoes.filter(
          (p: any) => p.status === "CRITICO",
        );
        const produtosAlerta = previsoes.filter(
          (p: any) => p.status === "ALERTA",
        );

        try {
          await mailer.sendMail({
            from:
              process.env.SMTP_FROM ||
              "OrthoPlus Enterprise <noreply@orthoplus.local>",
            to: adminEmails,
            subject: `Alerta de Reposicao IA: ${produtosCriticos.length} Criticos, ${produtosAlerta.length} Alertas`,
            html: `<p>Verifique o estoque no sistema. Detalhes: ${JSON.stringify(resumo)}</p>`,
          });
        } catch (e) {
          logger.error("Email failed", e);
        }

        await this.service["repo"].createAuditLog({
          clinic_id,
          user_id,
          action: "ALERTAS_REPOSICAO_ENVIADOS",
          details: { total_produtos: previsoes.length },
        });
      }

      res.json({
        success: true,
        message: result.message,
        destinatorios: adminEmails.length,
      });
    },
  );

  sendStockAlerts = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.service.sendStockAlerts();
    res.json({ success: true, ...result });
  });
}
