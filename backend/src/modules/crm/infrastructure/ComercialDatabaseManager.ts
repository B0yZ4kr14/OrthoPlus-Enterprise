import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { ComercialBackupService } from "./ComercialBackupService";

export class ComercialDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["comercial"], "COMERCIAL", new ComercialBackupService());
  }
}
