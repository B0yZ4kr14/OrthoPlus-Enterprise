/**
 * PacientesController - API REST Controller
 *
 * Expõe endpoints HTTP para operações de pacientes.
 */

import { logger } from "@/infrastructure/logger";
import { pacientesMetrics } from "@/infrastructure/metrics/PacientesMetrics";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const PATIENT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 3600 * 1000, // 24 hours
  path: "/",
};
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { CadastrarPacienteUseCase, CadastrarPacienteDTO } from "../application/use-cases/CadastrarPacienteUseCase";
import { AtualizarPacienteUseCase, AtualizarPacienteDTO } from "../application/use-cases/AtualizarPacienteUseCase";
import { IPatientRepository } from "../domain/repositories/IPatientRepository";
import { GetPatientQuery, GetPatientDTO } from "../application/queries/GetPatientQuery";
import { PacienteSearchService, SearchPacientesFilters } from "../application/services/PacienteSearchService";

export class PacientesController {
  constructor(
    private cadastrarUseCase: CadastrarPacienteUseCase,
    private atualizarUseCase: AtualizarPacienteUseCase,
    private alterarStatusUseCase: AlterarStatusPacienteUseCase,
    private patientRepository: IPatientRepository,
  ) {}

  /**
   * POST /api/pacientes
   * Cadastra novo paciente (com deduplicação CPF/email)
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
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

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      logger.error("Error creating patient", { error, body: req.body });
      const message = error instanceof Error ? error.message : "Erro ao criar paciente";
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * PUT /api/pacientes/:id
   * Atualiza dados de paciente existente (com deduplicação CPF/email)
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;

      const data: AtualizarPacienteDTO = {
        id,
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

      res.status(200).json({
        success: true,
        message: "Paciente atualizado com sucesso",
      });
    } catch (error: unknown) {
      logger.error("Error updating patient", {
        error,
        body: req.body,
        patientId: req.params.id,
      });
      const message = error instanceof Error ? error.message : "Erro ao atualizar paciente";
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }

  /**
   * GET /api/pacientes
   * Lista pacientes com filtros
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const filters = {
        clinicId: user.clinicId,
        statusCode: req.query.statusCode as string,
        searchTerm: req.query.searchTerm as string,
        origemId: req.query.origemId as string,
        promotorId: req.query.promotorId as string,
        campanhaId: req.query.campanhaId as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === "true" : undefined,
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      };

      const result = await this.patientRepository.findMany(filters, pagination);

      // Serializar para DTO
      const dto = {
        ...result,
        data: result.data.map((patient) => ({
          id: patient.id,
          fullName: patient.fullName,
          cpf: patient.cpf,
          email: patient.email,
          status: patient.status,
          dadosComerciais: patient.dadosComerciais,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
        })),
      };

      res.json({
        success: true,
        data: dto,
      });
    } catch (error: unknown) {
      logger.error("Error listing patients", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * GET /api/pacientes/:id
   * Busca paciente por ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;

      const dto: GetPatientDTO = { id, clinicId: user.clinicId };
      const handler = new GetPatientQuery(this.patientRepository);
      const patientView = await handler.execute(dto);

      if (!patientView) {
        res.status(404).json({
          success: false,
          error: "Paciente não encontrado",
        });
        return;
      }

      res.json({
        success: true,
        data: patientView,
      });
    } catch (error: unknown) {
      logger.error("Error getting patient", {
        error,
        patientId: req.params.id,
      });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * PATCH /api/pacientes/:id/status
   * Altera status do paciente
   */
  async changeStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      const { novoStatusCode, reason, metadata } = req.body;

      if (!novoStatusCode) {
        res.status(400).json({
          success: false,
          error: "novoStatusCode é obrigatório",
        });
        return;
      }

      await this.alterarStatusUseCase.execute({
        patientId: id,
        clinicId: user.clinicId,
        novoStatusCode,
        reason: reason || "Alteração manual",
        changedBy: user.id,
        metadata,
      });

      res.json({
        success: true,
        message: "Status alterado com sucesso",
      });
    } catch (error: unknown) {
      logger.error("Error changing patient status", {
        error,
        patientId: req.params.id,
      });
      res.status(400).json({
        success: false,
        error: "Erro ao alterar status",
      });
    }
  }

  /**
   * GET /api/pacientes/stats/by-status
   * Estatísticas por status
   */
  /**
   * GET /api/pacientes/search
   * Busca avançada de pacientes
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const clinicId = user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found" });
        return;
      }

      const filters: SearchPacientesFilters = {
        query: req.query.q as string | undefined,
        status: req.query.status as string | undefined,
        dentistaId: req.query.dentistaId as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const searchService = new PacienteSearchService();
      const result = await searchService.search(clinicId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      logger.error("Error searching patients", { error });
      res.status(500).json({
        success: false,
        error: "Erro ao buscar pacientes",
      });
    }
  }

  async statsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      const counts = await this.patientRepository.countByStatus(user.clinicId);

      res.json({
        success: true,
        data: counts,
      });
    } catch (error: unknown) {
      logger.error("Error getting stats by status", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * GET /api/pacientes/:id/timeline
   * Retorna a timeline combinada do paciente (Edge Function: patient-timeline)
   */
  async getPatientTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { id: patientId } = req.params;
      const user = req.user;
      const clinicId = user?.clinicId;

      if (!clinicId) {
        res.status(401).json({ error: "Clinic ID not found" });
        return;
      }

      const [appointments, treatments, budgets, statusChanges] =
        await Promise.all([
          this.patientRepository.findAppointmentsByPatient(patientId),
          this.patientRepository.findTratamentosByPatient(patientId),
          this.patientRepository.findBudgetsByPatient(patientId),
          this.patientRepository.findStatusHistoryByPatient(patientId),
        ]);

      const timeline = [
        ...appointments.map((a) => ({
          id: a.id,
          type: "appointment",
          title: a.title,
          description: `Consulta - ${a.status}`,
          date: a.start_time,
          icon: "calendar",
        })),
        ...treatments.map((t) => ({
          id: t.id,
          type: "treatment",
          title: t.titulo,
          description: `Tratamento - ${t.status}`,
          date: t.data_inicio || t.created_at,
          icon: "activity",
        })),
        ...budgets.map((b) => ({
          id: b.id,
          type: "budget",
          title: b.titulo,
          description: `Orçamento - R$ ${b.valor_total}`,
          date: b.created_at,
          icon: "file-text",
        })),
        ...statusChanges.map((s) => ({
          id: s.id,
          type: "status_change",
          title: "Mudança de Status",
          description: `${s.from_status} -> ${s.to_status}`,
          date: s.changed_at,
          icon: "refresh-cw",
        })),
      ].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());

      res.json({ timeline });
    } catch (error: unknown) {
      logger.error("Error getting patient timeline", {
        error,
        patientId: req.params.id,
      });
      res.status(500).json({ error: "Erro ao buscar timeline do paciente" });
    }
  }

  /**
   * POST /api/pacientes/auth
   * Autenticação de Paciente (Edge Function: patient-auth)
   */
  async patientAuth(req: Request, res: Response): Promise<void> {
    try {
      const { action, email, password } = req.body;

      if (action === "login") {
        const account = await this.patientRepository.findPatientAccountByEmail(email);

        if (!account) {
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }

        // Verify password against stored hash
        if (!account.senha_hash) {
          logger.warn("patient_accounts record missing senha_hash", { email });
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }
        const isValid = await bcrypt.compare(password, account.senha_hash);

        if (!isValid) {
          res.status(401).json({ error: "Email ou senha inválidos" });
          return;
        }

        const sessionId = crypto.randomUUID();

        await this.patientRepository.createPatientSession({
          id: sessionId,
          patient_id: account.patient_id,
          token: sessionId,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

        res.cookie("patient_session", sessionId, PATIENT_COOKIE_OPTIONS);

        res.status(200).json({
          patient: {
            id: account.patient_id,
            email: account.email,
          },
        });
        return;
      }

      if (action === "signup") {
        // Stub for signup
        res
          .status(201)
          .json({ success: true, message: "Conta criada com sucesso!" });
        return;
      }

      if (action === "logout") {
        const sessionId = req.cookies?.patient_session as string | undefined;
        if (sessionId) {
          await this.patientRepository.deletePatientSessionsBySessionId(sessionId);
        }
        res.clearCookie("patient_session", { path: "/" });
        res.status(200).json({ success: true });
        return;
      }

      res.status(400).json({ error: "Ação inválida" });
    } catch (error: unknown) {
      logger.error("Error in patient auth", { error });
      res.status(500).json({ error: "Erro interno na autenticação" });
    }
  }

  /**
   * DELETE /api/pacientes/:id
   * Remove paciente (soft delete)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      // Fetch patient status before deletion for metrics (TD004)
      const patient = await this.patientRepository.findPatientById(id);
      await this.patientRepository.delete(id, clinicId);
      if (patient && patient.status) {
        pacientesMetrics.decPatientsTotal(patient.status, clinicId);
      }
      res.status(200).json({ success: true, message: "Paciente removido" });
    } catch (error: unknown) {
      logger.error("Error deleting patient", { error });
      res.status(500).json({ error: "Erro ao remover paciente" });
    }
  }
}
