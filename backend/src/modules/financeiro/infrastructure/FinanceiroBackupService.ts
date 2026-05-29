import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class FinanceiroBackupService extends CategoryBackupService {
  constructor() {
    super(
      ["financeiro", "pdv", "faturamento", "crypto_config"],
      "FINANCEIRO",
      process.env.DATABASE_URL ?? "",
    );
  }
}
