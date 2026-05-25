import { z } from "zod"

export const appointmentCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.string(),
  title: z.enum(["CONSULTA", "RETORNO", "EMERGENCIA", "AVALIACAO", "PROCEDIMENTO"]),
  description: z.string().optional(),
  treatment_id: z.string().uuid().optional().nullable(),
  created_by: z.string(),
})

export const appointmentUpdateSchema = z.object({
  dentist_id: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  treatment_id: z.string().uuid().optional().nullable(),
})

export const confirmationCreateSchema = z.object({
  appointment_id: z.string().uuid(),
  status: z.string(),
  confirmation_method: z.string(),
  confirmed_at: z.string().optional().nullable(),
  message_content: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  sent_at: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
})

export const confirmationUpdateSchema = z.object({
  status: z.string().optional(),
  confirmation_method: z.string().optional(),
  confirmed_at: z.string().optional().nullable(),
  message_content: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  sent_at: z.string().optional().nullable(),
  error_message: z.string().optional().nullable(),
})

export const blockedTimeCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  reason: z.string(),
  created_by: z.string(),
})

export const dentistScheduleCreateSchema = z.object({
  dentist_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean(),
  created_by: z.string(),
})

export const dentistScheduleUpdateSchema = z.object({
  dentist_id: z.string().uuid().optional(),
  day_of_week: z.number().int().min(0).max(6).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_active: z.boolean().optional(),
})
