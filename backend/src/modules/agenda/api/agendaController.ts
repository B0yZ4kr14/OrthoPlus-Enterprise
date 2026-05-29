import { Request, Response, NextFunction } from "express";
import { AgendaService } from "@/modules/agenda/application/AgendaService";
import { logger } from "@/infrastructure/logger";

const service = new AgendaService();

function requireClinic(req: Request): string | null {
  return req.user?.clinicId ?? null;
}

function wrap<T>(
  fn: (clinicId: string, req: Request) => Promise<T>,
  statusCode: number = 200,
  emptyResponse?: boolean,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const clinicId = requireClinic(req);
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    try {
      const result = await fn(clinicId, req);
      if (emptyResponse) {
        res.status(204).send();
        return;
      }
      res.status(statusCode).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res
          .status(error.statusCode)
          .json({ error: error.message, details: error.details });
        return;
      }
      logger.error("Agenda controller error:", { error });
      next(error);
    }
  };
}

export const getAppointments = wrap(async (clinicId, req) => {
  const { dentist_id, patient_id, status, start_date, end_date } = req.query;

  const statusFilter = (() => {
    if (!status) return undefined;
    const s = status as string;
    if (s.startsWith("not.in.")) {
      const excluded = s
        .replace("not.in.", "")
        .replace("(", "")
        .replace(")", "")
        .split(",");
      return { notIn: excluded };
    }
    return s;
  })();

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

  return service.listAppointments(clinicId, {
    dentistId: dentist_id as string | undefined,
    patientId: patient_id as string | undefined,
    status: statusFilter,
    startTime: startTimeFilter,
  });
});

export const getAppointmentById = wrap(async (clinicId, req) =>
  service.getAppointment(req.params.id, clinicId),
);

export const createAppointment = wrap(
  async (clinicId, req) => service.createAppointment(clinicId, req.body),
  201,
);

export const updateAppointment = wrap(async (clinicId, req) =>
  service.updateAppointment(req.params.id, clinicId, req.body),
);

export const deleteAppointment = wrap(
  async (clinicId, req) => {
    await service.deleteAppointment(req.params.id, clinicId);
    return {};
  },
  204,
  true,
);

export const checkConflict = wrap(async (clinicId, req) => {
  const { dentist_id, start_time, end_time, exclude_id } = req.query;
  if (!dentist_id || !start_time || !end_time) {
    const err = new Error("dentist_id, start_time, end_time required") as any;
    err.statusCode = 400;
    throw err;
  }
  return service.checkConflict(clinicId, {
    dentistId: dentist_id as string,
    startTime: start_time as string,
    endTime: end_time as string,
    excludeId: exclude_id as string | undefined,
  });
});

export const getConfirmations = wrap(async (clinicId, req) => {
  const { appointment_id, status } = req.query;
  return service.listConfirmations(clinicId, {
    appointmentId: appointment_id as string | undefined,
    status: status as string | undefined,
  });
});

export const getConfirmationById = wrap(async (clinicId, req) =>
  service.getConfirmation(req.params.id, clinicId),
);

export const createConfirmation = wrap(
  async (clinicId, req) => service.createConfirmation(clinicId, req.body),
  201,
);

export const updateConfirmation = wrap(async (clinicId, req) =>
  service.updateConfirmation(req.params.id, clinicId, req.body),
);

export const deleteConfirmation = wrap(
  async (clinicId, req) => {
    await service.deleteConfirmation(req.params.id, clinicId);
    return {};
  },
  204,
  true,
);

export const getBlockedTimes = wrap(async (clinicId, req) => {
  const { dentist_id, active, start_date, end_date } = req.query;

  const endDatetimeFilter: { gte?: string; gt?: string } = {};
  if (active === "true") endDatetimeFilter.gte = new Date().toISOString();
  if (start_date)
    endDatetimeFilter.gt = new Date(start_date as string).toISOString();

  return service.listBlockedTimes(clinicId, {
    dentistId: dentist_id as string | undefined,
    endDatetime:
      Object.keys(endDatetimeFilter).length > 0 ? endDatetimeFilter : undefined,
    startDatetime: end_date
      ? { lt: new Date(end_date as string).toISOString() }
      : undefined,
  });
});

export const getBlockedTimeById = wrap(async (clinicId, req) =>
  service.getBlockedTime(req.params.id, clinicId),
);

export const createBlockedTime = wrap(
  async (clinicId, req) => service.createBlockedTime(clinicId, req.body),
  201,
);

export const deleteBlockedTime = wrap(
  async (clinicId, req) => {
    await service.deleteBlockedTime(req.params.id, clinicId);
    return {};
  },
  204,
  true,
);

export const getDentistSchedules = wrap(async (clinicId, req) => {
  const { dentist_id, day_of_week, is_active } = req.query;
  return service.listDentistSchedules(clinicId, {
    dentistId: dentist_id as string | undefined,
    dayOfWeek: day_of_week !== undefined ? Number(day_of_week) : undefined,
    isActive: is_active !== undefined ? is_active === "true" : undefined,
  });
});

export const getDentistScheduleById = wrap(async (clinicId, req) =>
  service.getDentistSchedule(req.params.id, clinicId),
);

export const createDentistSchedule = wrap(
  async (clinicId, req) => service.createDentistSchedule(clinicId, req.body),
  201,
);

export const updateDentistSchedule = wrap(async (clinicId, req) =>
  service.updateDentistSchedule(req.params.id, clinicId, req.body),
);

export const deleteDentistSchedule = wrap(
  async (clinicId, req) => {
    await service.deleteDentistSchedule(req.params.id, clinicId);
    return {};
  },
  204,
  true,
);
