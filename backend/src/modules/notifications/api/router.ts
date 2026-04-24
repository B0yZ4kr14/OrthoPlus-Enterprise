import { clinicGuard } from "@/middleware/clinicGuard";
import { Request, Response, Router } from "express";
import { NotificationController } from "./notificationController";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

const router: Router = Router();
router.use(clinicGuard);
const controller = new NotificationController();

// GET / - List notifications for the authenticated user's clinic
router.get("/", async (req: Request, res: Response) => {
  try {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      res.status(401).json({ error: "Missing clinic context" });
      return;
    }
    const notifications = await prisma.notifications.findMany({
      where: { clinic_id: clinicId },
      orderBy: { created_at: "desc" },
      take: 100,
      select: {
        id: true,
        clinic_id: true,
        tipo: true,
        titulo: true,
        mensagem: true,
        link_acao: true,
        lida: true,
        created_at: true,
      },
    });
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
    await prisma.notifications.updateMany({
      where: { id, clinic_id: clinicId },
      data: { lida: true },
    });
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
    await prisma.notifications.updateMany({
      where: { clinic_id: clinicId, lida: false },
      data: { lida: true },
    });
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
