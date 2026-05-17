import { clinicGuard } from "@/middleware/clinicGuard";
import { dbRouter } from "./dbRouter";
/**
 * Pacientes Router - Rotas do módulo PACIENTES
 *
 * Define rotas HTTP e integra com controller.
 */

import { Router } from "express";
import { AlterarStatusPacienteUseCase } from "../application/use-cases/AlterarStatusPacienteUseCase";
import { CadastrarPacienteUseCase } from "../application/use-cases/CadastrarPacienteUseCase";
import { AtualizarPacienteUseCase } from "../application/use-cases/AtualizarPacienteUseCase";
import { PatientRepositoryPostgres } from "../infrastructure/repositories/PatientRepositoryPostgres";
import { PacientesController } from "./PacientesController";


// Injeção de dependências
const patientRepository = new PatientRepositoryPostgres();

const cadastrarUseCase = new CadastrarPacienteUseCase(patientRepository);
const atualizarUseCase = new AtualizarPacienteUseCase(patientRepository);
const alterarStatusUseCase = new AlterarStatusPacienteUseCase(patientRepository);

const controller = new PacientesController(
  cadastrarUseCase,
  atualizarUseCase,
  alterarStatusUseCase,
  patientRepository,
);

// Router
const router: Router = Router();
router.use(clinicGuard);

// POST /api/pacientes - Cadastrar paciente
router.post("/", (req, res) => controller.create(req, res));

// PUT /api/pacientes/:id - Atualizar paciente
router.put("/:id", (req, res) => controller.update(req, res));

// GET /api/pacientes - Listar pacientes
router.get("/", (req, res) => controller.list(req, res));

// GET /api/pacientes/:id - Buscar paciente
router.get("/:id", (req, res) => controller.getById(req, res));

// DELETE /api/pacientes/:id - Remover paciente
router.delete("/:id", (req, res) => controller.delete(req, res));

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

router.use("/db", dbRouter);

export { router as pacientesRouter };
