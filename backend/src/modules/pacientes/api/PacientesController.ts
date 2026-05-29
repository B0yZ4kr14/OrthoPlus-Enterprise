import { pacientesMetrics } from "@/infrastructure/metrics/PacientesMetrics";
import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { eventBus } from "@/shared/events/EventBus";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import {
  CadastrarPacienteUseCase,
  CadastrarPacienteDTO,
} from "../application/use-cases/CadastrarPacienteUseCase";
import {
  AtualizarPacienteUseCase,
  AtualizarPacienteDTO,
} from "../application/use-cases/AtualizarPacienteUseCase";
import { IPatientRepository } from "../domain/repositories/IPatientRepository";
import { PatientDeletedEvent } from "../domain/events/PatientDeletedEvent";
import {
  GetPatientQuery,
  GetPatientDTO,
} from "../application/queries/GetPatientQuery";
import { PacientesControllerService } from "../application/PacientesControllerService";

const PATIENT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 3600 * 1000,
  path: "/",
};

export class PacientesController {
  private service: PacientesControllerService;

  constructor(
    private cadastrarUseCase: CadastrarPacienteUseCase,
    private atualizarUseCase: AtualizarPacienteUseCase,
    private alterarStatusUseCase: AlterarStatusPacienteUseCase,
    private patientRepository: IPatientRepository,
  ) {
    this.service = new PacientesControllerService(patientRepository);
  }

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const data: CadastrarPacienteDTO = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      cpf: req.body.cpf,
      rg: req.body.rg,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      mobile: req.body.mobile,
      addressStreet: req.body.addressStreet,
      addressNumber: req.body.addressNumber,
      addressComplement: req.body.addressComplement,
      addressNeighborhood: req.body.addressNeighborhood,
      addressCity: req.body.addressCity,
      addressState: req.body.addressState,
      addressZipcode: req.body.addressZipcode,
      statusCode: req.body.statusCode,
      notes: req.body.notes,
      clinicId: user.clinicId,
      createdBy: user.id,
    };
    const result = await this.cadastrarUseCase.execute(data);
    res.status(201).json({ success: true, data: result });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const data: AtualizarPacienteDTO = {
      id: req.params.id,
      clinicId: user.clinicId,
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      cpf: req.body.cpf,
      rg: req.body.rg,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      mobile: req.body.mobile,
      addressStreet: req.body.addressStreet,
      addressNumber: req.body.addressNumber,
      addressComplement: req.body.addressComplement,
      addressNeighborhood: req.body.addressNeighborhood,
      addressCity: req.body.addressCity,
      addressState: req.body.addressState,
      addressZipcode: req.body.addressZipcode,
      notes: req.body.notes,
      updatedBy: user.id,
    };
    await this.atualizarUseCase.execute(data);
    res
      .status(200)
      .json({ success: true, message: "Paciente atualizado com sucesso" });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const filters = {
      statusCode: req.query.statusCode as string,
      searchTerm: req.query.searchTerm as string,
      origemId: req.query.origemId as string,
      promotorId: req.query.promotorId as string,
      campanhaId: req.query.campanhaId as string,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    };
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as "asc" | "desc",
    };
    const dto = await this.service.list(user.clinicId, filters, pagination);
    res.json({ success: true, data: dto });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const dto: GetPatientDTO = { id: req.params.id, clinicId: user.clinicId };
    const handler = new GetPatientQuery(this.patientRepository);
    const patientView = await handler.execute(dto);
    if (!patientView) {
      throw Errors.notFound("Paciente não encontrado");
    }
    res.json({ success: true, data: patientView });
  });

  changeStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const { novoStatusCode, reason, metadata } = req.body;
    if (!novoStatusCode) {
      throw Errors.validation("novoStatusCode é obrigatório");
    }
    await this.alterarStatusUseCase.execute({
      patientId: id,
      clinicId: user.clinicId,
      novoStatusCode,
      reason: reason || "Alteração manual",
      changedBy: user.id,
      metadata,
    });
    res.json({ success: true, message: "Status alterado com sucesso" });
  });

  search = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    const filters = {
      query: req.query.q as string | undefined,
      status: req.query.status as string | undefined,
      dentistaId: req.query.dentistaId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined,
    };
    const result = await this.service.search(clinicId, filters);
    res.json({ success: true, data: result });
  });

  statsByStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    const counts = await this.patientRepository.countByStatus(user.clinicId);
    res.json({ success: true, data: counts });
  });

  getPatientTimeline = asyncHandler(async (req: Request, res: Response) => {
    const { id: patientId } = req.params;
    const clinicId = req.user?.clinicId;
    const timeline = await this.service.buildTimeline(patientId, clinicId);
    res.json({ timeline });
  });

  patientAuth = asyncHandler(async (req: Request, res: Response) => {
    const { action, email, password } = req.body;
    const result = await this.service.patientAuth(
      action,
      email,
      password,
      req.cookies?.patient_session as string | undefined,
    );

    if (result.action === "login") {
      res.cookie("patient_session", result.sessionId!, PATIENT_COOKIE_OPTIONS);
      res.status(200).json({ patient: result.patient });
      return;
    }

    if (result.action === "signup") {
      res
        .status(201)
        .json({ success: true, message: "Conta criada com sucesso!" });
      return;
    }

    if (result.action === "logout") {
      res.clearCookie("patient_session", { path: "/" });
      res.status(200).json({ success: true });
      return;
    }

    res.status(400).json({ error: "Ação inválida" });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }
    const patient = await this.patientRepository.findPatientById(id);
    await this.patientRepository.delete(id, clinicId);
    if (patient && patient.status) {
      pacientesMetrics.decPatientsTotal(patient.status, clinicId);
    }
    // Publicar evento de remoção de forma não-bloqueante
    eventBus.publish(new PatientDeletedEvent(id, clinicId)).catch(() => {
      // Silenciar erro para não interromper a resposta HTTP
    });
    res.status(200).json({ success: true, message: "Paciente removido" });
  });
}
