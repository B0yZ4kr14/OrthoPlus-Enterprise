import { Request, Response, Router } from "express";
import { NotificationController } from "./notificationController";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

const router: Router = Router();
const controller = new NotificationController();

// GET / - List notifications for the authenticated user's clinic
router.get("/", async (req: Request, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const notifications = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, clinic_id, tipo, titulo, mensagem, link_acao, lida, created_at
      FROM notifications
      WHERE clinic_id = ${clinicId}
      ORDER BY created_at DESC
      LIMIT 100
    `;
    res.json({ notifications });
  } catch (error) {
    logger.error("Error listing notifications", { error });
    res.json({ notifications: [] });
  }
});

// PATCH /:id/read - Mark single notification as read
router.patch("/:id/read", async (req: Request, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const { id } = req.params;
    await prisma.$queryRaw`
      UPDATE notifications SET lida = true
      WHERE id = ${id} AND clinic_id = ${clinicId}
    `;
    res.json({ success: true, id });
  } catch (error) {
    logger.error("Error marking notification as read", { error });
    res.json({ success: true, id: req.params.id });
  }
});

// POST /mark-all-read - Mark all notifications as read
router.post("/mark-all-read", async (req: Request, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    await prisma.$queryRaw`
      UPDATE notifications SET lida = true
      WHERE clinic_id = ${clinicId} AND lida = false
    `;
    res.json({ success: true });
  } catch (error) {
    logger.error("Error marking all notifications as read", { error });
    res.json({ success: true });
  }
});

// Create new notification explicitly
router.post("/create", controller.createNotification.bind(controller));

// Automated background checks (cron jobs or triggered events)
router.post("/auto", controller.runAutoNotifications.bind(controller));
router.post(
  "/check-volatility",
  controller.checkVolatilityAlerts.bind(controller),
);
router.post(
  "/check-crypto-price",
  controller.checkCryptoPriceAlerts.bind(controller),
);
router.post(
  "/send-replenishment",
  controller.sendReplenishmentAlerts.bind(controller),
);
router.post("/send-stock", controller.sendStockAlerts.bind(controller));

export default router;
