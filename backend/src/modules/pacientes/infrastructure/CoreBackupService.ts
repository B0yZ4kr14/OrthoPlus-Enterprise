import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class CoreBackupService extends CategoryBackupService {
  constructor() {
    super(["core", "pacientes", "pep"], "CORE", process.env.DATABASE_URL ?? "");
  }
}
