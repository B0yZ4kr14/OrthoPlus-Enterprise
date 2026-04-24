import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class AdministrativoDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["administrativo", "configuracoes", "database_admin", "backups"], "ADMINISTRATIVO");
  }
}
