import { Router } from "express";
import { AuthController } from "./AuthController";

export function createAuthRouter(): Router {
  const router: Router = Router();
  const controller = new AuthController();

  router.post("/token", controller.login);
  router.post("/patient-auth", controller.patientAuth);
  router.get("/user", controller.getUser);
  router.get("/user/:id/metadata", controller.getUserMetadata);
  router.get("/me", controller.getUser);
  router.post("/logout", controller.logout);
  router.post("/register", controller.registerStaff);

  return router;
}
