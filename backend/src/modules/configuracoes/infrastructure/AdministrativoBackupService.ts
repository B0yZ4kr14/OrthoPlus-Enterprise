import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class AdministrativoBackupService extends CategoryBackupService {
  constructor() {
    super(
      ["administrativo", "configuracoes", "database_admin", "backups"],
      "ADMINISTRATIVO",
      process.env.DATABASE_URL ?? "",
    );
  }
}
