import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { CryptoConfigControllerService } from "@/modules/crypto_config/application/CryptoConfigControllerService";

const CRYPTO_ENABLED = process.env.ENABLE_CRYPTO_MODULE === "true";

export class CryptoConfigController {
  private service = new CryptoConfigControllerService();

  private checkEnabled(res: Response): boolean {
    if (!CRYPTO_ENABLED) {
      res.status(503).json({ error: "Crypto module is disabled" });
      return false;
    }
    return true;
  }

  listExchanges = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = this.service.listExchanges(clinicId);
    res.json({ exchanges: result });
  });

  createExchange = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    const isAdmin = req.user?.role === "ADMIN";
    const result = this.service.createExchange(
      clinicId || "",
      req.body,
      isAdmin,
    );
    res.status(201).json(result);
  });

  getPortfolio = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = this.service.getPortfolio();
    res.json({ portfolio: result });
  });

  getDCAStrategies = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = this.service.getDCAStrategies();
    res.json({ strategies: result });
  });

  manageOfflineWallet = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const result = await this.service.manageOfflineWallet(
      req.body,
      req.user?.clinicId,
    );
    res.json({ success: true, ...result });
  });

  validateXpub = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const { xpub } = req.body;
    const result = this.service.validateXpub(xpub);
    res.json(result);
  });

  syncCryptoWallet = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const { walletId } = req.body;
    if (!walletId) {
      throw Errors.validation("walletId is required");
    }
    const result = this.service.syncCryptoWallet(walletId);
    res.json({ success: true, ...result });
  });

  realtimeNotify = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const result = this.service.realtimeNotify();
    res.json({ success: true, ...result });
  });

  webhookCryptoTransaction = asyncHandler(
    async (req: Request, res: Response) => {
      if (!this.checkEnabled(res)) return;
      const result = await this.service.webhookCryptoTransaction(
        req.body,
        req.user?.clinicId,
        req.ip || undefined,
      );
      res.json({
        success: true,
        message: "Webhook processed successfully",
        ...result,
      });
    },
  );

  generatePaymentAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!this.checkEnabled(res)) return;
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Nao autenticado");
    }
    const { coin_type, wallet_id } = req.body;
    const result = this.service.generatePaymentAddress(
      clinicId,
      coin_type,
      wallet_id,
    );
    res.json(result);
  });
}
