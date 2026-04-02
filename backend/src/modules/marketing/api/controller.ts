import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createCampanhaSchema, updateCampanhaSchema, createEnvioSchema, createRecallSchema } from "./schemas";

export class MarketingController {
  // --- Campanhas ---
  async listCampanhas(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { status } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (status) where.status = String(status);
      const data = await (prisma as any).marketing_campaigns.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing marketing campaigns", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCampanhaById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const data = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!data) {
        res.status(404).json({ error: "Campanha not found" });
        return;
      }
      res.json(data);
    } catch (error) {
      logger.error("Error getting marketing campaign", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCampanha(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createCampanhaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).marketing_campaigns.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating marketing campaign", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCampanha(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { id } = req.params;
      const existing = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id, clinic_id: clinicId },
      });
      if (!existing) {
        res.status(404).json({ error: "Campanha not found" });
        return;
      }
      const parsed = updateCampanhaSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).marketing_campaigns.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id },
        data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating marketing campaign", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Envios ---
  async listEnvios(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { campanha_id, status_envio } = req.query;
      const where: Record<string, unknown> = { campanha: { clinic_id: clinicId } };
      if (campanha_id) where.campanha_id = String(campanha_id);
      if (status_envio) where.status_envio = String(status_envio);
      const data = await (prisma as any).campanha_envios.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { enviado_em: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing campaign envios", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createEnvio(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createEnvioSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const campanha = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: parsed.data.campanha_id, clinic_id: clinicId },
      });
      if (!campanha) {
        res.status(404).json({ error: "Campanha not found" });
        return;
      }
      const data = await (prisma as any).campanha_envios.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: parsed.data,
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating campaign envio", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Recalls ---
  async listRecalls(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { tipo_recall } = req.query;
      const where: Record<string, unknown> = { clinic_id: clinicId };
      if (tipo_recall) where.tipo_recall = String(tipo_recall);
      const data = await (prisma as any).recalls.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        orderBy: { data_prevista: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing recalls", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createRecall(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createRecallSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const data = await (prisma as any).recalls.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating recall", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Process Campaign Triggers ---
  async processTriggers(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }

      // Find active campaigns with active triggers
      const activeTriggers = await prisma.$queryRaw<Array<{
        trigger_id: string;
        campaign_id: string;
        campaign_name: string;
        campaign_type: string;
        channel: string;
        trigger_type: string;
        trigger_condition: string;
        delay_days: number | null;
        delay_hours: number | null;
        template_id: string | null;
      }>>`
        SELECT
          ct.id AS trigger_id,
          mc.id AS campaign_id,
          mc.name AS campaign_name,
          mc.campaign_type,
          mc.channel,
          ct.trigger_type,
          ct.trigger_condition::text,
          ct.delay_days,
          ct.delay_hours,
          mc.template_id
        FROM campaign_triggers ct
        JOIN marketing_campaigns mc ON mc.id = ct.campaign_id
        WHERE mc.clinic_id = ${clinicId}
          AND mc.status = 'ACTIVE'
          AND ct.is_active = true
        LIMIT 100
      `;

      if (activeTriggers.length === 0) {
        res.json({ message: "No active triggers found", triggered: 0 });
        return;
      }

      const now = new Date();
      let triggered = 0;
      const results: Array<{ campaign: string; trigger: string; sends: number }> = [];

      for (const trigger of activeTriggers) {
        let condition: { event?: string; status?: string; days_after?: number };
        try {
          condition = JSON.parse(trigger.trigger_condition);
        } catch (parseError) {
          logger.warn("Invalid trigger_condition JSON", {
            triggerId: trigger.trigger_id,
            raw: trigger.trigger_condition,
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
          continue;
        }

        let recipients: Array<{ patient_id: string; patient_name: string; email: string | null }> = [];

        // Match trigger type to patient segment
        if (trigger.trigger_type === "TIME_BASED" || condition.event === "birthday") {
          // Birthday-based trigger: patients with birthday today
          const todayMonth = now.getMonth() + 1;
          const todayDay = now.getDate();
          recipients = await prisma.$queryRaw<typeof recipients>`
            SELECT p.id AS patient_id, p.full_name AS patient_name, p.email
            FROM patients p
            WHERE p.clinic_id = ${clinicId}
              AND EXTRACT(MONTH FROM p.birth_date) = ${todayMonth}
              AND EXTRACT(DAY FROM p.birth_date) = ${todayDay}
            LIMIT 500
          `;
        } else if (condition.event === "appointment" && condition.status === "completed") {
          // Post-appointment trigger: patients who completed appointments recently
          const delayDays = trigger.delay_days || 1;
          const targetDate = new Date(now);
          targetDate.setDate(targetDate.getDate() - delayDays);
          const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

          recipients = await prisma.$queryRaw<typeof recipients>`
            SELECT DISTINCT p.id AS patient_id, p.full_name AS patient_name, p.email
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = ${clinicId}
              AND a.status = 'concluido'
              AND a.end_time >= ${startOfDay}
              AND a.end_time <= ${endOfDay}
            LIMIT 500
          `;
        } else if (condition.event === "no_visit") {
          // Behavioral trigger: patients who haven't visited in N days
          const daysThreshold = condition.days_after || 90;
          const cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

          recipients = await prisma.$queryRaw<typeof recipients>`
            SELECT p.id AS patient_id, p.full_name AS patient_name, p.email
            FROM patients p
            WHERE p.clinic_id = ${clinicId}
              AND p.id NOT IN (
                SELECT DISTINCT a.patient_id FROM appointments a
                WHERE a.clinic_id = ${clinicId}
                  AND a.start_time >= ${cutoffDate}
              )
            LIMIT 500
          `;
        }

        // Skip if no matching recipients
        if (recipients.length === 0) continue;

        // Check for already-sent messages to avoid duplicates (within last 24h)
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        let sendCount = 0;
        for (const recipient of recipients) {
          // Check if already sent to this recipient for this campaign recently
          const alreadySent = await prisma.$queryRaw<Array<{ cnt: bigint }>>`
            SELECT COUNT(*)::bigint AS cnt FROM campanha_envios
            WHERE campanha_id = ${trigger.campaign_id}
              AND destinatario_id = ${recipient.patient_id}
              AND created_at >= ${oneDayAgo}
          `;

          if (alreadySent[0] && BigInt(alreadySent[0].cnt) > 0n) continue;

          // Create send record
          await (prisma as any).campanha_envios.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
            data: {
              campanha_id: trigger.campaign_id,
              destinatario_id: recipient.patient_id,
              destinatario_tipo: "PATIENT",
              email: recipient.email,
              status_envio: "PENDING",
            },
          });

          // Create notification for the clinic
          await prisma.$queryRaw`
            INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
            VALUES (
              ${clinicId}, 'MARKETING',
              ${'Campanha: ' + trigger.campaign_name},
              ${'Envio agendado para ' + (recipient.patient_name || 'paciente') + ' via ' + trigger.channel},
              '/marketing-auto'
            )
          `;

          sendCount++;
        }

        if (sendCount > 0) {
          triggered++;
          results.push({
            campaign: trigger.campaign_name,
            trigger: trigger.trigger_type,
            sends: sendCount,
          });
        }
      }

      logger.info("Campaign triggers processed", {
        clinicId,
        triggersChecked: activeTriggers.length,
        triggered,
      });

      res.json({
        success: true,
        triggersChecked: activeTriggers.length,
        triggered,
        results,
      });
    } catch (error) {
      logger.error("Error processing campaign triggers", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // --- Process Pending Recalls ---
  async processRecalls(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }

      // Find recalls due today or overdue that haven't been sent yet
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const pendingRecalls = await prisma.$queryRaw<Array<{
        id: string;
        patient_id: string;
        patient_name: string;
        patient_email: string | null;
        tipo_recall: string;
        data_prevista: string;
        mensagem_personalizada: string | null;
        metodo_notificacao: string | null;
      }>>`
        SELECT
          r.id,
          r.patient_id,
          p.full_name AS patient_name,
          p.email AS patient_email,
          r.tipo_recall,
          r.data_prevista,
          r.mensagem_personalizada,
          r.metodo_notificacao
        FROM recalls r
        JOIN patients p ON r.patient_id = p.id
        WHERE r.clinic_id = ${clinicId}
          AND r.status = 'PENDING'
          AND r.notificacao_enviada = false
          AND r.data_prevista <= ${today.toISOString()}
        LIMIT 200
      `;

      let processed = 0;
      for (const recall of pendingRecalls) {
        const mensagem = recall.mensagem_personalizada
          || `Olá ${recall.patient_name || ""}, está na hora do seu retorno (${recall.tipo_recall}).`;

        // Create notification
        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (
            ${clinicId}, 'LEMBRETE',
            ${'Recall: ' + recall.tipo_recall},
            ${mensagem},
            '/recall'
          )
        `;

        // Mark recall as sent
        await prisma.$queryRaw`
          UPDATE recalls SET notificacao_enviada = true, status = 'SENT'
          WHERE id = ${recall.id}
        `;

        processed++;
      }

      res.json({
        success: true,
        pending: pendingRecalls.length,
        processed,
      });
    } catch (error) {
      logger.error("Error processing recalls", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
