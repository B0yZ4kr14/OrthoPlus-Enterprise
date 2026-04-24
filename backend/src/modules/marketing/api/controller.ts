import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { createCampanhaSchema, updateCampanhaSchema, createEnvioSchema, createRecallSchema } from "./schemas";
import { asyncHandler, Errors } from "@/middleware/errorHandler";

export class MarketingController {
  // --- Campanhas ---
  listCampanhas = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { status } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (status) where.status = String(status);
    const data = await (prisma as any).marketing_campaigns.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where,
      orderBy: { created_at: "desc" },
    });
    res.json(data);
  });

  getCampanhaById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const data = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!data) {
      throw Errors.notFound("Campanha");
    }
    res.json(data);
  });

  createCampanha = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).marketing_campaigns.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
  });

  updateCampanha = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    const existing = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    if (!existing) {
      throw Errors.notFound("Campanha");
    }
    const parsed = updateCampanhaSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).marketing_campaigns.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: parsed.data,
    });
    res.json(data);
  });

  // --- Envios ---
  listEnvios = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
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
  });

  createEnvio = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createEnvioSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const campanha = await (prisma as any).marketing_campaigns.findFirst({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id: parsed.data.campanha_id, clinic_id: clinicId },
    });
    if (!campanha) {
      throw Errors.notFound("Campanha");
    }
    const data = await (prisma as any).campanha_envios.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: parsed.data,
    });
    res.status(201).json(data);
  });

  // --- Recalls ---
  listRecalls = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { tipo_recall } = req.query;
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (tipo_recall) where.tipo_recall = String(tipo_recall);
    const data = await (prisma as any).recalls.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where,
      orderBy: { data_prevista: "desc" },
    });
    res.json(data);
  });

  createRecall = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const parsed = createRecallSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
    const data = await (prisma as any).recalls.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { ...parsed.data, clinic_id: clinicId },
    });
    res.status(201).json(data);
  });

  // --- Process Campaign Triggers ---
  processTriggers = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    // Find active campaigns with active triggers
    const activeTriggers = await prisma.campaign_triggers.findMany({
      where: {
        is_active: true,
        campaign: {
          clinic_id: clinicId,
          status: "ACTIVE",
        },
      },
      include: {
        campaign: true,
      },
      take: 100,
    });

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
        const rawCondition = typeof trigger.trigger_condition === "string"
          ? trigger.trigger_condition
          : JSON.stringify(trigger.trigger_condition);
        condition = JSON.parse(rawCondition);
      } catch (parseError) {
        logger.warn("Invalid trigger_condition JSON", {
          triggerId: trigger.id,
          raw: trigger.trigger_condition,
          error: parseError instanceof Error ? parseError.message : String(parseError),
        });
        continue;
      }

      let recipients: Array<{ patient_id: string; patient_name: string; email: string | null }> = [];

      // Match trigger type to patient segment
      if (trigger.trigger_type === "TIME_BASED" || condition.event === "birthday") {
        // Birthday-based trigger: patients with birthday today.
        // Prisma Client does not support EXTRACT(MONTH/DAY FROM date) natively.
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

        const appointmentRecalls = await prisma.appointments.findMany({
          where: {
            clinic_id: clinicId,
            status: "concluido",
            end_time: { gte: startOfDay.toISOString(), lte: endOfDay.toISOString() },
          },
          include: {
            patient: {
              select: { id: true, full_name: true, email: true },
            },
          },
          distinct: ["patient_id"],
          take: 500,
        });
        recipients = appointmentRecalls
          .filter((a) => a.patient)
          .map((a) => ({
            patient_id: a.patient!.id,
            patient_name: a.patient!.full_name || "",
            email: a.patient!.email || null,
          }));
      } else if (condition.event === "no_visit") {
        // Behavioral trigger: patients who haven't visited in N days
        const daysThreshold = condition.days_after || 90;
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

        const recentAppointmentPatientIds = await prisma.appointments.findMany({
          where: {
            clinic_id: clinicId,
            start_time: { gte: cutoffDate.toISOString() },
          },
          select: { patient_id: true },
          distinct: ["patient_id"],
        });
        const recentPatientIds = new Set(recentAppointmentPatientIds.map((a) => a.patient_id));
        recipients = await prisma.patients.findMany({
          where: {
            clinic_id: clinicId,
            id: { notIn: Array.from(recentPatientIds) },
          },
          select: { id: true, full_name: true, email: true },
          take: 500,
        }).then((patients) =>
          patients.map((p) => ({
            patient_id: p.id,
            patient_name: p.full_name || "",
            email: p.email || null,
          })),
        );
      }

      // Skip if no matching recipients
      if (recipients.length === 0) continue;

      // Check for already-sent messages to avoid duplicates (within last 24h)
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      let sendCount = 0;
      for (const recipient of recipients) {
        // Check if already sent to this recipient for this campaign recently
        const alreadySent = await prisma.campanha_envios.count({
          where: {
            campanha_id: trigger.campaign.id,
            destinatario_id: recipient.patient_id,
            created_at: { gte: oneDayAgo },
          },
        });

        if (alreadySent > 0) continue;

        // Create send record
        await (prisma as any).campanha_envios.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
          data: {
            campanha_id: trigger.campaign.id,
            destinatario_id: recipient.patient_id,
            destinatario_tipo: "PATIENT",
            email: recipient.email,
            status_envio: "PENDING",
          },
        });

        // Create notification for the clinic
        await prisma.notifications.create({
          data: {
            clinic_id: clinicId,
            tipo: 'MARKETING',
            titulo: 'Campanha: ' + trigger.campaign.name,
            mensagem: 'Envio agendado para ' + (recipient.patient_name || 'paciente') + ' via ' + trigger.campaign.channel,
            link_acao: '/marketing-auto',
            lida: false,
          },
        });

        sendCount++;
      }

      if (sendCount > 0) {
        triggered++;
        results.push({
          campaign: trigger.campaign.name,
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
  });

  // --- Process Pending Recalls ---
  processRecalls = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    // Find recalls due today or overdue that haven't been sent yet
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const pendingRecallsRaw = await prisma.recalls.findMany({
      where: {
        clinic_id: clinicId,
        status: "PENDING",
        notificacao_enviada: false,
        data_prevista: { lte: today.toISOString() },
      },
      include: {
        patient: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
      take: 200,
    });
    const pendingRecalls = pendingRecallsRaw.map((r) => ({
      id: r.id,
      patient_id: r.patient_id,
      patient_name: r.patient?.full_name || "",
      patient_email: r.patient?.email || null,
      tipo_recall: r.tipo_recall,
      data_prevista: r.data_prevista,
      mensagem_personalizada: r.mensagem_personalizada,
      metodo_notificacao: r.metodo_notificacao,
    }));

    let processed = 0;
    for (const recall of pendingRecalls) {
      const mensagem = recall.mensagem_personalizada
        || `Olá ${recall.patient_name || ""}, está na hora do seu retorno (${recall.tipo_recall}).`;

      // Create notification
      await prisma.notifications.create({
        data: {
          clinic_id: clinicId,
          tipo: 'LEMBRETE',
          titulo: 'Recall: ' + recall.tipo_recall,
          mensagem,
          link_acao: '/recall',
          lida: false,
        },
      });

      // Mark recall as sent
      await prisma.recalls.update({
        where: { id: recall.id },
        data: { notificacao_enviada: true, status: 'SENT' },
      });

      processed++;
    }

    res.json({
      success: true,
      pending: pendingRecalls.length,
      processed,
    });
  });

  deleteCampanha = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const { id } = req.params;
    await (prisma as any).marketing_campaigns.deleteMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id, clinic_id: clinicId },
    });
    res.status(204).send();
  });
}
