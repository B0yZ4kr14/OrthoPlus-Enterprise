import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class OperacionalDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["operacional", "inventario"], "OPERACIONAL");
  }
}
