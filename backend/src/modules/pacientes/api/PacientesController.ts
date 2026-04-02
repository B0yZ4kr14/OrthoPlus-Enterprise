/**
 * PacientesController - API REST Controller
 *
 * Expõe endpoints HTTP para operações de pacientes.
 */

import { logger } from "@/infrastructure/logger";
import { prisma } from "@/infrastructure/database/prismaClient";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { IPatientRepository } from "../domain/repositories/IPatientRepository";
import { CreatePatientCommand, CreatePatientDTO } from "../application/commands/CreatePatientCommand";
import { UpdatePatientCommand, UpdatePatientDTO } from "../application/commands/UpdatePatientCommand";
import { GetPatientQuery, GetPatientDTO } from "../application/queries/GetPatientQuery";

export class PacientesController {
  constructor(
    private alterarStatusUseCase: AlterarStatusPacienteUseCase,
    private patientRepository: IPatientRepository,
  ) {}

  /**
   * POST /api/pacientes
   * Cadastra novo paciente
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      // Build the full DTO from request body.
      // NOTE: The CommandBus cannot be used correctly here because this codebase's
      // CQRS implementation conflates the command handler class with the command DTO
      // (both share the same constructor name, which the bus uses for routing).
      // We call the command handler directly — the same pattern used by
      // PatientCommandController (api/commands/PatientCommandController.ts).
      const data: CreatePatientDTO = {
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

      const handler = new CreatePatientCommand(this.patientRepository);
      const result = await handler.execute(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      logger.error("Error creating patient", { error, body: req.body });
      res.status(400).json({
        success: false,
        error: "Erro ao criar paciente",
      });
    }
  }

  /**
   * PUT /api/pacientes/:id
   * Atualiza dados de paciente existente
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;

      const data: UpdatePatientDTO = {
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

      const handler = new UpdatePatientCommand(this.patientRepository);
      await handler.execute(data);

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
      res.status(400).json({
        success: false,
        error: "Erro ao atualizar paciente",
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
        isActive: req.query.isActive === "true",
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
          createdAt: patient.toObject().createdAt,
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
          prisma.appointments.findMany({
            where: { patient_id: patientId, clinic_id: clinicId },
            select: {
              id: true,
              title: true,
              start_time: true,
              status: true,
              created_at: true,
            },
            orderBy: { start_time: "desc" },
            take: 20,
          }),
          prisma.$queryRaw<Array<{ id: string; titulo: string; status: string; data_inicio: string | null; created_at: Date }>>` 
            SELECT pt.id, pt.titulo, pt.status, pt.data_inicio, pt.created_at
            FROM pep_tratamentos pt
            JOIN prontuarios p ON p.id = pt.prontuario_id
            WHERE p.patient_id = ${patientId}
              AND p.clinic_id = ${clinicId}
            ORDER BY pt.created_at DESC
            LIMIT 20
          `,
          prisma.budgets.findMany({
            where: { patient_id: patientId, clinic_id: clinicId },
            select: {
              id: true,
              titulo: true,
              valor_total: true,
              status: true,
              created_at: true,
            },
            orderBy: { created_at: "desc" },
            take: 20,
          }),
          prisma.patient_status_history.findMany({
            where: { patient_id: patientId },
            select: {
              id: true,
              from_status: true,
              to_status: true,
              changed_at: true,
            },
            orderBy: { changed_at: "desc" },
            take: 20,
          }),
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
        const account = await prisma.patient_accounts.findFirst({
          where: { email },
        });

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

        await prisma.patient_sessions.create({
          data: {
            id: sessionId,
            patient_id: account.patient_id,
            token: sessionId,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        });

        res.status(200).json({
          token: sessionId,
          sessionId,
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
        const sessionId = req.headers["x-session-id"] as string;
        if (sessionId) {
          await prisma.patient_sessions.deleteMany({
            where: { id: sessionId },
          });
        }
        res.status(200).json({ success: true });
        return;
      }

      res.status(400).json({ error: "Ação inválida" });
    } catch (error: unknown) {
      logger.error("Error in patient auth", { error });
      res.status(500).json({ error: "Erro interno na autenticação" });
    }
  }
}
