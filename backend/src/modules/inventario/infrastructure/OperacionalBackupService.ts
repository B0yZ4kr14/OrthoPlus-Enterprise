import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class OperacionalBackupService extends CategoryBackupService {
  constructor() {
    super(["operacional", "inventario"], "OPERACIONAL", process.env.DATABASE_URL ?? "");
  }
}
