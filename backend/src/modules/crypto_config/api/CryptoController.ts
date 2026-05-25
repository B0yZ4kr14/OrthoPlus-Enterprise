import { Request, Response } from "express";
import { Errors, asyncHandler } from "@/middleware/errorHandler";
import { CryptoControllerService } from "@/modules/crypto_config/application/CryptoControllerService";

export class CryptoController {
  private service = new CryptoControllerService();

  convertCryptoToBrl = asyncHandler(async (req: Request, res: Response) => {
    const { transactionId } = req.body;
    if (!transactionId) {
      throw Errors.validation("transactionId is required");
    }
    const result = await this.service.convertCryptoToBrl(transactionId, req.ip || undefined);
    res.status(200).json({ success: true, ...result });
  });

  createCryptoInvoice = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.service.createCryptoInvoice(req.body, req.ip || undefined);
    res.status(201).json({ success: true, ...result });
  });

  getCryptoManagerStatus = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, status: "active" });
  });

  getCryptoRates = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.service.getCryptoRates();
    res.status(200).json({ success: true, ...result });
  });

  syncCryptoWallet = asyncHandler(async (req: Request, res: Response) => {
    const { walletId } = req.body;
    res.status(200).json({ success: true, wallet_id: walletId, status: "synced" });
  });

  validateXpub = asyncHandler(async (req: Request, res: Response) => {
    const { xpub, currency } = req.body;
    const result = this.service.validateXpub(xpub, currency);
    res.status(200).json({ success: true, ...result });
  });

  handleCryptoWebhook = asyncHandler(async (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Webhook processed" });
  });

  manageOfflineWallet = asyncHandler(async (req: Request, res: Response) => {
    const { action } = req.body;
    res.status(200).json({ success: true, message: `Action ${action} processed for offline wallet` });
  });

  runCryptoJobs = asyncHandler(async (req: Request, res: Response) => {
    const { jobName } = req.body;
    res.status(200).json({ success: true, job: jobName, executed: true });
  });
}
