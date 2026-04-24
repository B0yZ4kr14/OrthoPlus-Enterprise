import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

export class ClinicoBackupService extends CategoryBackupService {
  constructor() {
    super(["clinico"], "CLINICO", process.env.DATABASE_URL ?? "");
  }
}
