import { logger } from "@/infrastructure/logger";
import { AgendaRepository } from "@/modules/agenda/infrastructure/AgendaRepository";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CreateAppointmentCommandHandler } from "../application/commands/CreateAppointmentCommand";
import { AppointmentRepositoryPostgres } from "../infrastructure/repositories/AppointmentRepositoryPostgres";
import { eventBus } from "@/shared/events/EventBus";
import { agendaMetrics } from "@/infrastructure/metrics/AgendaMetrics";

// ---------------------------------------------------------------------------
// Auth helper — returns clinicId from JWT or sends 401 and returns null
// ---------------------------------------------------------------------------

function requireClinicContext(req: Request, res: Response): string | null {
  const clinicId = req.user?.clinicId;
  if (!clinicId) {
    res.status(401).json({ error: "Missing clinic context" });
    return null;
  }
  return clinicId;
}

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

const appointmentCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.string(),
  title: z.enum(["CONSULTA", "RETORNO", "EMERGENCIA", "AVALIACAO", "PROCEDIMENTO"]),
  description: z.string().optional(),
  treatment_id: z.string().uuid().optional().nullable(),
  created_by: z.string(),
});

const appointmentUpdateSchema = z.object({
  dentist_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  treatment_id: z.string().uuid().optional().nullable(),
});

const confirmationCreateSchema = z.object({
  appointment_id: z.string().uuid(),
  status: z.string(),
  confirmation_method: z.string(),
  confirmed_at: z.string().optional().nullable(),
  message_content: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  sent_at: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
});

const confirmationUpdateSchema = z.object({
  status: z.string().optional(),
  confirmation_method: z.string().optional(),
  confirmed_at: z.string().optional().nullable(),
  message_content: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  sent_at: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
});

const blockedTimeCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  reason: z.string(),
  created_by: z.string(),
});

const dentistScheduleCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean(),
  created_by: z.string(),
});

const dentistScheduleUpdateSchema = z.object({
  dentist_id: z.string().uuid().optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_active: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

const agendaRepo = new AgendaRepository();

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  const start = Date.now();
  try {
    const { dentist_id, patient_id, status, start_date, end_date } = req.query;

    const statusFilter = (() => {
      if (!status) return undefined;
      const s = status as string;
      if (s.startsWith("not.in.")) {
        const excluded = s.replace("not.in.(", "").replace(")", "").split(",");
        return { notIn: excluded };
      }
      return s;
    })();

    // start_time is a String column — use ISO string comparison
    const startTimeFilter =
      start_date || end_date
        ? {
            ...(start_date
              ? { gte: new Date(start_date as string).toISOString() }
              : {}),
            ...(end_date
              ? { lte: new Date(end_date as string).toISOString() }
              : {}),
          }
        : undefined;

    const appointments = await agendaRepo.findAppointments(clinicId, {
      dentistId: dentist_id as string | undefined,
      patientId: patient_id as string | undefined,
      status: statusFilter,
      startTime: startTimeFilter,
    });

    const duration = Date.now() - start;
    agendaMetrics.observeCalendarLoadDuration(clinicId, duration);
    res.json(appointments);
  } catch (error) {
    const duration = Date.now() - start;
    agendaMetrics.observeCalendarLoadDuration(clinicId, duration);
    logger.error("Error fetching appointments:", { error });
    next(error);
    return;
  }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;
    const appointment = await agendaRepo.findAppointmentById(id, clinicId);

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json(appointment);
  } catch (error) {
    logger.error("Error fetching appointment:", { error });
    next(error);
    return;
  }
};

const appointmentRepo = new AppointmentRepositoryPostgres();
const createAppointmentHandler = new CreateAppointmentCommandHandler(appointmentRepo, eventBus);

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const parsed = appointmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const appointment = await createAppointmentHandler.execute({
      patientId: parsed.data.patient_id,
      dentistId: parsed.data.dentist_id,
      startTime: new Date(parsed.data.start_time),
      endTime: new Date(parsed.data.end_time),
      type: parsed.data.title,
      notes: parsed.data.description,
      clinicId,
      createdBy: parsed.data.created_by,
    });
    res.status(201).json(appointment);
  } catch (error) {
    logger.error("Error creating appointment:", { error });
    next(error);
    return;
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findAppointmentById(id, clinicId);
    if (!existing) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    const parsed = appointmentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const appointment = await agendaRepo.updateAppointment(id, {
      ...parsed.data,
      updated_at: new Date(),
    });
    res.json(appointment);
  } catch (error) {
    logger.error("Error updating appointment:", { error });
    next(error);
    return;
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findAppointmentById(id, clinicId);
    if (!existing) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    await agendaRepo.deleteAppointment(id);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting appointment:", { error });
    next(error);
    return;
  }
};

export const checkConflict = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { dentist_id, start_time, end_time, exclude_id } = req.query;

    if (!dentist_id || !start_time || !end_time) {
      res
        .status(400)
        .json({ error: "dentist_id, start_time, end_time required" });
      return;
    }

    // start_time and end_time are String columns — use ISO string comparison
    const startIso = new Date(start_time as string).toISOString();
    const endIso = new Date(end_time as string).toISOString();

    const conflicts = await agendaRepo.findAppointmentConflicts(
      clinicId,
      dentist_id as string,
      startIso,
      endIso,
      exclude_id as string | undefined
    );

    res.json({ hasConflict: conflicts.length > 0, count: conflicts.length });
  } catch (error) {
    logger.error("Error checking conflict:", { error });
    next(error);
    return;
  }
};

// ---------------------------------------------------------------------------
// Confirmations
// appointment_confirmations has no clinic_id column — tenant isolation is
// enforced by verifying the linked appointment belongs to the clinic.
// ---------------------------------------------------------------------------

export const getConfirmations = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { appointment_id, status } = req.query;

    // Collect appointment IDs that belong to this clinic
    const clinicAppointments = await agendaRepo.findAppointments(clinicId, {
      ...(appointment_id ? { id: appointment_id as string } : {}),
    });
    const appointmentIds = clinicAppointments.map((a) => a.id);

    const confirmations = await agendaRepo.findConfirmationsByAppointmentIds(
      appointmentIds,
      status as string | undefined
    );
    res.json(confirmations);
  } catch (error) {
    logger.error("Error fetching confirmations:", { error });
    next(error);
    return;
  }
};

export const getConfirmationById = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;
    const confirmation = await agendaRepo.findConfirmationById(id);
    if (!confirmation) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    // Verify the linked appointment belongs to this clinic
    const appointment = await agendaRepo.findAppointmentById(
      confirmation.appointment_id,
      clinicId
    );
    if (!appointment) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    res.json(confirmation);
  } catch (error) {
    logger.error("Error fetching confirmation:", { error });
    next(error);
    return;
  }
};

export const createConfirmation = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const parsed = confirmationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    // Verify the appointment belongs to this clinic
    const appointment = await agendaRepo.findAppointmentById(
      parsed.data.appointment_id,
      clinicId
    );
    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    const confirmation = await agendaRepo.createConfirmation(parsed.data);
    res.status(201).json(confirmation);
  } catch (error) {
    logger.error("Error creating confirmation:", { error });
    next(error);
    return;
  }
};

export const updateConfirmation = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findConfirmationById(id);
    if (!existing) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    // Verify the linked appointment belongs to this clinic
    const appointment = await agendaRepo.findAppointmentById(
      existing.appointment_id,
      clinicId
    );
    if (!appointment) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    const parsed = confirmationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const confirmation = await agendaRepo.updateConfirmation(id, parsed.data);
    res.json(confirmation);
  } catch (error) {
    logger.error("Error updating confirmation:", { error });
    next(error);
    return;
  }
};

export const deleteConfirmation = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findConfirmationById(id);
    if (!existing) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    // Verify the linked appointment belongs to this clinic
    const appointment = await agendaRepo.findAppointmentById(
      existing.appointment_id,
      clinicId
    );
    if (!appointment) {
      res.status(404).json({ error: "Confirmation not found" });
      return;
    }

    await agendaRepo.deleteConfirmation(id);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting confirmation:", { error });
    next(error);
    return;
  }
};

// ---------------------------------------------------------------------------
// Blocked Times
// ---------------------------------------------------------------------------

export const getBlockedTimes = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { dentist_id, active, start_date, end_date } = req.query;

    // end_datetime and start_datetime are String columns — use ISO string comparison
    const endDatetimeFilter: { gte?: string; gt?: string } = {};
    if (active === "true")
      endDatetimeFilter.gte = new Date().toISOString();
    if (start_date)
      endDatetimeFilter.gt = new Date(start_date as string).toISOString();

    const items = await agendaRepo.findBlockedTimes(clinicId, {
      dentistId: dentist_id as string | undefined,
      endDatetime:
        Object.keys(endDatetimeFilter).length > 0
          ? (endDatetimeFilter as any)
          : undefined,
      startDatetime: end_date
        ? { lt: new Date(end_date as string).toISOString() }
        : undefined,
    });
    res.json(items);
  } catch (error) {
    logger.error("Error fetching blocked times:", { error });
    next(error);
    return;
  }
};

export const getBlockedTimeById = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;
    const item = await agendaRepo.findBlockedTimeById(id, clinicId);
    if (!item) {
      res.status(404).json({ error: "Blocked time not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    logger.error("Error fetching blocked time:", { error });
    next(error);
    return;
  }
};

export const createBlockedTime = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const parsed = blockedTimeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const item = await agendaRepo.createBlockedTime({
      ...parsed.data,
      clinic_id: clinicId,
    });
    res.status(201).json(item);
  } catch (error) {
    logger.error("Error creating blocked time:", { error });
    next(error);
    return;
  }
};

export const deleteBlockedTime = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findBlockedTimeById(id, clinicId);
    if (!existing) {
      res.status(404).json({ error: "Blocked time not found" });
      return;
    }

    await agendaRepo.deleteBlockedTime(id);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting blocked time:", { error });
    next(error);
    return;
  }
};

// ---------------------------------------------------------------------------
// Dentist Schedules
// ---------------------------------------------------------------------------

export const getDentistSchedules = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { dentist_id, day_of_week, is_active } = req.query;

    const where: {
      clinic_id: string;
      dentist_id?: string;
      day_of_week?: number;
      is_active?: boolean;
    } = { clinic_id: clinicId };

    if (dentist_id) where.dentist_id = dentist_id as string;
    if (day_of_week !== undefined) where.day_of_week = Number(day_of_week);
    if (is_active !== undefined) where.is_active = is_active === "true";

    const items = await agendaRepo.findDentistSchedules(clinicId, {
      dentistId: where.dentist_id,
      dayOfWeek: where.day_of_week,
      isActive: where.is_active,
    });
    res.json(items);
  } catch (error) {
    logger.error("Error fetching dentist schedules:", { error });
    next(error);
    return;
  }
};

export const getDentistScheduleById = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;
    const item = await agendaRepo.findDentistScheduleById(id, clinicId);
    if (!item) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    logger.error("Error fetching dentist schedule:", { error });
    next(error);
    return;
  }
};

export const createDentistSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const parsed = dentistScheduleCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const item = await agendaRepo.createDentistSchedule({
      ...parsed.data,
      clinic_id: clinicId,
    });
    res.status(201).json(item);
  } catch (error) {
    logger.error("Error creating dentist schedule:", { error });
    next(error);
    return;
  }
};

export const updateDentistSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findDentistScheduleById(id, clinicId);
    if (!existing) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    const parsed = dentistScheduleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const item = await agendaRepo.updateDentistSchedule(id, parsed.data);
    res.json(item);
  } catch (error) {
    logger.error("Error updating dentist schedule:", { error });
    next(error);
    return;
  }
};

export const deleteDentistSchedule = async (req: Request, res: Response, next: NextFunction) => {
  const clinicId = requireClinicContext(req, res);
  if (!clinicId) return;

  try {
    const { id } = req.params;

    const existing = await agendaRepo.findDentistScheduleById(id, clinicId);
    if (!existing) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    await agendaRepo.deleteDentistSchedule(id);
    res.status(204).send();
  } catch (error) {
    logger.error("Error deleting dentist schedule:", { error });
    next(error);
    return;
  }
};
