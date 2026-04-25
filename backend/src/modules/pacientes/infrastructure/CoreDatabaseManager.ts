import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { CoreBackupService } from "./CoreBackupService";

export class CoreDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(
      ["core", "pacientes", "pep"],
      "CORE",
      new CoreBackupService()
    );
  }
}
