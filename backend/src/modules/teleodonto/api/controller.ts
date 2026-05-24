import { Request, Response } from "express"
import { asyncHandler, Errors } from "@/middleware/errorHandler"
import { TeleodontoService } from "../services/TeleodontoService"
import {
  createTeleconsultaSchema,
  updateTeleconsultaSchema,
  startSessionSchema,
  endSessionSchema,
  addNotesSchema,
  addPrescriptionSchema,
} from "./schemas"

export class TeleodontoController {
  private service: TeleodontoService

  constructor(service?: TeleodontoService) {
    this.service = service || new TeleodontoService()
  }

  listTeleconsultas = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { status, dentist_id } = req.query
    const data = await this.service.listTeleconsultas(clinicId, {
      status: status ? String(status) : undefined,
      dentist_id: dentist_id ? String(dentist_id) : undefined,
    })

    res.json(data)
  })

  getById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { id } = req.params
    const data = await this.service.getById(id, clinicId)
    res.json(data)
  })

  create = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const parsed = createTeleconsultaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const data = await this.service.create(parsed.data, clinicId, req.user?.id)
    res.status(201).json(data)
  })

  update = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { id } = req.params
    const parsed = updateTeleconsultaSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const data = await this.service.update(id, parsed.data, clinicId)
    res.json(data)
  })

  delete = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const { id } = req.params
    await this.service.delete(id, clinicId)
    res.status(204).send()
  })

  startSession = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const parsed = startSessionSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const data = await this.service.startSession(parsed.data, clinicId)
    res.json({ ...data, message: "Session started successfully" })
  })

  endSession = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const parsed = endSessionSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const data = await this.service.endSession(parsed.data, clinicId)
    res.json({ ...data, message: "Session ended successfully" })
  })

  addNotes = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const parsed = addNotesSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const data = await this.service.addNotes(parsed.data, clinicId)
    res.json(data)
  })

  addPrescription = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context")
    }

    const parsed = addPrescriptionSchema.safeParse(req.body)
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as unknown as Array<{ field: string; message: string; code: string }>)
    }

    const { data, prescription } = await this.service.addPrescription(
      parsed.data,
      clinicId,
      req.user?.id,
    )
    res.json({ ...data, prescription })
  })
}
