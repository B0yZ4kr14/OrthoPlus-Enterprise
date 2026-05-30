import { clinicGuard } from "@/middleware/clinicGuard";
import { Router, Request, Response } from "express";
import { PepController } from "./PepController";

export function createPepRouter(): Router {
  const router: Router = Router();
  router.use(clinicGuard);
  const controller = new PepController();

  // Rota raiz
  router.get("/", (_req: Request, res: Response) => {
    res.json({
      module: "pep",
      message:
        "Prontuario Eletronico do Paciente — use /prontuarios/patient/:patientId para listar prontuarios",
      endpoints: [
        "/prontuarios",
        "/prontuarios/patient/:patientId",
        "/odontogramas/patient/:patientId",
        "/odontogramas/history",
        "/evolucoes",
        "/tratamentos",
        "/anexos",
      ],
    });
  });

  // Prontuarios
  router.post("/prontuarios", controller.createProntuario);
  router.get(
    "/prontuarios/patient/:patientId",
    controller.listProntuariosByPatient,
  );
  router.post("/prontuarios/:id/assinar", controller.assinarDigitalmente);
  router.patch("/prontuarios/:id", controller.updateProntuario);
  router.delete("/prontuarios/:id", controller.deleteProntuario);

  // Odontogramas
  router.get(
    "/odontogramas/patient/:patientId",
    controller.getOdontogramaByPatient,
  );
  router.get("/odontogramas/history", controller.getOdontogramaHistory);
  router.post("/odontogramas/history", controller.createOdontogramaHistory);
  router.get("/odontogramas/:id", controller.getOdontogramaById);
  router.post("/odontogramas", controller.upsertOdontograma);
  router.put("/odontogramas/:id", controller.updateOdontograma);
  router.patch("/odontogramas/:id", controller.updateOdontograma);
  router.delete("/odontogramas/:id", controller.deleteOdontograma);

  // Anexos
  router.post("/anexos", controller.createAnexo);
  router.patch("/anexos/:id", controller.updateAnexo);
  router.delete("/anexos/:id", controller.deleteAnexo);

  // Evolucoes
  router.post("/evolucoes", controller.createEvolucao);
  router.patch("/evolucoes/:id", controller.updateEvolucao);
  router.delete("/evolucoes/:id", controller.deleteEvolucao);

  // Tratamentos
  router.get("/tratamentos", controller.listTratamentos);
  router.get("/tratamentos/:id", controller.getTratamentoById);
  router.post("/tratamentos", controller.createTratamento);
  router.patch("/tratamentos/:id", controller.updateTratamento);
  router.delete("/tratamentos/:id", controller.deleteTratamento);

  // Odontograma data
  router.put("/odontogramas/data/tooth", controller.upsertOdontogramaDataTooth);
  router.put(
    "/odontogramas/data/surface",
    controller.upsertOdontogramaDataSurface,
  );
  router.delete("/odontogramas/data", controller.deleteOdontogramaData);

  return router;
}
