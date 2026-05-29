import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { OperacionalBackupService } from "./OperacionalBackupService";

export class OperacionalDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(
      ["operacional", "inventario"],
      "OPERACIONAL",
      new OperacionalBackupService(),
    );
  }
}
