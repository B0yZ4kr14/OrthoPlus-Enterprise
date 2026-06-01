import { Router } from "express";
import { clinicGuard } from "@/middleware/clinicGuard";
import { AuthController } from "./AuthController";

export function createAuthRouter(): Router {
  const router: Router = Router();
  const controller = new AuthController();

  // Pre-authentication routes (no clinicGuard)
  router.post("/token", controller.login);
  router.post("/patient-auth", controller.patientAuth);
  router.post("/register", controller.registerStaff);
  router.post("/reset-password", controller.resetPassword);
  router.post("/update-password", controller.resetPassword);

  // Post-authentication routes (require clinic context)
  router.use(clinicGuard);
  router.get("/user", controller.getUser);
  router.get("/user/:id/metadata", controller.getUserMetadata);
  router.get("/me", controller.getUser);
  router.post("/logout", controller.logout);

  return router;
}
