import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class ClinicoDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["clinico"], "CLINICO");
  }
}
