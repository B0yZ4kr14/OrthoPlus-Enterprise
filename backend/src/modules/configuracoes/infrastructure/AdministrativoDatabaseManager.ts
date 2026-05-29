import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { AdministrativoBackupService } from "./AdministrativoBackupService";

export class AdministrativoDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(
      ["administrativo", "configuracoes", "database_admin", "backups"],
      "ADMINISTRATIVO",
      new AdministrativoBackupService(),
    );
  }
}
