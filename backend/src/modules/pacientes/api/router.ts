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
router.post("/", controller.create);

// PUT /api/pacientes/:id - Atualizar paciente
router.put("/:id", controller.update);

// GET /api/pacientes/search - Busca avançada
router.get("/search", controller.search);

// GET /api/pacientes - Listar pacientes
router.get("/", controller.list);

// GET /api/pacientes/:id - Buscar paciente
router.get("/:id", controller.getById);

// DELETE /api/pacientes/:id - Remover paciente
router.delete("/:id", controller.delete);

// PATCH /api/pacientes/:id/status - Alterar status
router.patch("/:id/status", controller.changeStatus);

// GET /api/pacientes/stats/by-status - Estatísticas por status
router.get("/stats/by-status", controller.statsByStatus);

// POST /api/pacientes/auth - Auth de pacientes
router.post("/auth", controller.patientAuth);

// GET /api/pacientes/:id/timeline - Timeline de paciente
router.get("/:id/timeline", controller.getPatientTimeline);

router.use("/db", dbRouter);

export { router as pacientesRouter };
