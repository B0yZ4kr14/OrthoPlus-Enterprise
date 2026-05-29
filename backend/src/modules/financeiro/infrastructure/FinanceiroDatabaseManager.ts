import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";
import { FinanceiroBackupService } from "./FinanceiroBackupService";

export class FinanceiroDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(
      ["financeiro", "pdv", "faturamento", "crypto_config"],
      "FINANCEIRO",
      new FinanceiroBackupService(),
    );
  }
}
