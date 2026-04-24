import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class ComercialBackupService extends CategoryBackupService {
  constructor() {
    super(["comercial"], "COMERCIAL", process.env.DATABASE_URL ?? "");
  }
}
