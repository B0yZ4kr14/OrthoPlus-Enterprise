import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { AgentsControllerService } from "@/modules/agents/application/AgentsControllerService";

export class AgentsController {
  private service = new AgentsControllerService();

  health = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const result = await this.service.health();
      res.json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      res.status(503).json({
        status: "error",
        message: "Agent Service indisponivel",
        error: errorMessage,
        hint: "Verifique se o servico Python esta rodando em localhost:8000",
      });
    }
  });

  createCRUD = asyncHandler(async (req: Request, res: Response) => {
    if (!this.service.checkPermission(req.user?.role, ["ADMIN", "DEV"])) {
      throw Errors.forbidden(
        `Esta operacao requer uma das permissoes: ADMIN, DEV. Role atual: ${req.user?.role || "none"}`,
      );
    }
    const result = await this.service.createCRUD(req.body);
    res.json({ success: true, ...result });
  });

  createCRUDSimple = asyncHandler(async (req: Request, res: Response) => {
    if (!this.service.checkPermission(req.user?.role, ["ADMIN", "DEV"])) {
      throw Errors.forbidden(
        `Esta operacao requer uma das permissoes: ADMIN, DEV. Role atual: ${req.user?.role || "none"}`,
      );
    }
    const result = await this.service.createCRUDSimple(req.body);
    res.json({ success: true, ...result });
  });

  fixBug = asyncHandler(async (req: Request, res: Response) => {
    if (
      !this.service.checkPermission(req.user?.role, ["ADMIN", "DEV", "SUPPORT"])
    ) {
      throw Errors.forbidden(
        `Esta operacao requer uma das permissoes: ADMIN, DEV, SUPPORT. Role atual: ${req.user?.role || "none"}`,
      );
    }
    const result = await this.service.fixBug(req.body);
    res.json({ success: true, ...result });
  });

  refactor = asyncHandler(async (req: Request, res: Response) => {
    if (!this.service.checkPermission(req.user?.role, ["ADMIN", "DEV"])) {
      throw Errors.forbidden(
        `Esta operacao requer uma das permissoes: ADMIN, DEV. Role atual: ${req.user?.role || "none"}`,
      );
    }
    const result = await this.service.refactor(req.body);
    res.json({ success: true, ...result });
  });

  codeReview = asyncHandler(async (req: Request, res: Response) => {
    if (
      !this.service.checkPermission(req.user?.role, [
        "ADMIN",
        "DEV",
        "REVIEWER",
      ])
    ) {
      throw Errors.forbidden(
        `Esta operacao requer uma das permissoes: ADMIN, DEV, REVIEWER. Role atual: ${req.user?.role || "none"}`,
      );
    }
    const result = await this.service.codeReview(req.body);
    res.json({ success: true, ...result });
  });
}
