/**
 * Pacientes Router - Rotas do módulo PACIENTES
 *
 * Define rotas HTTP e integra com controller.
 */

import { Router } from "express";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { PatientRepositoryPostgres } from "../infrastructure/repositories/PatientRepositoryPostgres";
import { PacientesController } from "./PacientesController";
import { CommandBus } from "@/shared/cqrs/CommandBus";
import { QueryBus } from "@/shared/cqrs/QueryBus";
import { CreatePatientCommand } from "../application/commands/CreatePatientCommand";
import { UpdatePatientCommand } from "../application/commands/UpdatePatientCommand";
import { GetPatientQuery } from "../application/queries/GetPatientQuery";

// Injeção de dependências
const patientRepository = new PatientRepositoryPostgres();

const commandBus = new CommandBus();
const queryBus = new QueryBus();

// Handlers Registros
commandBus.register("CreatePatientCommand", new CreatePatientCommand(patientRepository));
commandBus.register("UpdatePatientCommand", new UpdatePatientCommand(patientRepository));
queryBus.register("GetPatientQuery", new GetPatientQuery(patientRepository));

const alterarStatusUseCase = new AlterarStatusPacienteUseCase(
  patientRepository,
);

const controller = new PacientesController(
  alterarStatusUseCase,
  patientRepository,
);

// Router
const router: Router = Router();

// POST /api/pacientes - Cadastrar paciente
router.post("/", (req, res) => controller.create(req, res));

// PUT /api/pacientes/:id - Atualizar paciente
router.put("/:id", (req, res) => controller.update(req, res));

// GET /api/pacientes - Listar pacientes
router.get("/", (req, res) => controller.list(req, res));

// GET /api/pacientes/:id - Buscar paciente
router.get("/:id", (req, res) => controller.getById(req, res));

// PATCH /api/pacientes/:id/status - Alterar status
router.patch("/:id/status", (req, res) => controller.changeStatus(req, res));

// GET /api/pacientes/stats/by-status - Estatísticas por status
router.get("/stats/by-status", (req, res) =>
  controller.statsByStatus(req, res),
);

// POST /api/pacientes/auth - Auth de pacientes
router.post("/auth", (req, res) => controller.patientAuth(req, res));

// GET /api/pacientes/:id/timeline - Timeline de paciente
router.get("/:id/timeline", (req, res) =>
  controller.getPatientTimeline(req, res),
);

export { router as pacientesRouter };
