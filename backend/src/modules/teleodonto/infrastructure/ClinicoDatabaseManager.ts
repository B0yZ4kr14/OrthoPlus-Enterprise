import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { ClinicoBackupService } from "./ClinicoBackupService";

export class ClinicoDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["clinico"], "CLINICO", new ClinicoBackupService());
  }
}
