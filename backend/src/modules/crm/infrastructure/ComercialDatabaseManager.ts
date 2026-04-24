import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class ComercialDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["comercial"], "COMERCIAL");
  }
}
