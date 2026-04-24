import { CategoryDatabaseManager } from "@/infrastructure/database/CategoryDatabaseManager";

export class FinanceiroDatabaseManager extends CategoryDatabaseManager {
  constructor() {
    super(["financeiro", "pdv", "faturamento", "crypto_config"], "FINANCEIRO");
  }
}
