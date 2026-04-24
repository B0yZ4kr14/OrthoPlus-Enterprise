import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class CoreDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["core", "pacientes", "pep"], "CORE");
  }
}
