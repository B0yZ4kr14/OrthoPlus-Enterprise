import { Router } from "express";
import {
  createRootUser,
  analyzeDatabaseHealth,
  githubProxy,
  globalSearch
} from "../controllers/adminController";

const adminRouter = Router();

// Define routes mapped to controller actions
adminRouter.post("/create-root-user", createRootUser);
adminRouter.get("/analyze-database-health", analyzeDatabaseHealth);
adminRouter.all("/github-proxy", githubProxy);
adminRouter.get("/global-search", globalSearch);

export default adminRouter;
