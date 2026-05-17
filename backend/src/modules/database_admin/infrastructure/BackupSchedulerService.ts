/**
 * BackupSchedulerService — Orquestração unificada de backups por categoria
 * 
 * Responsabilidades:
 * - Executar backup de qualquer categoria via pg_dump
 * - Listar backups de todas as categorias
 * - Fornecer status consolidado de backup
 * 
 * DevSecOps:
 * - Nunca expõe DATABASE_URL diretamente
 * - Sanitiza inputs (category whitelist)
 * - Retention policy automática (mantém 10 backups)
 */

import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";
import { DB_CATEGORIES } from "./MasterDatabaseManager";

export interface CategoryBackupStatus {
  category: string;
  lastBackup: string | null;
  lastBackupSize: number | null;
  lastBackupSizeHuman: string;
  backupCount: number;
  schemas: string[];
}

export interface BackupExecutionResult {
  category: string;
  success: boolean;
  filePath: string;
  sizeBytes: number;
  sizeHuman: string;
  durationMs: number;
  schemas: string[];
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export class BackupSchedulerService {
  private getBackupService(category: string): CategoryBackupService | null {
    const catConfig = DB_CATEGORIES.find((c) => c.name === category);
    if (!catConfig) return null;
    return new CategoryBackupService(
      catConfig.schemas,
      catConfig.name,
      process.env.DATABASE_URL ?? ""
    );
  }

  async getAllBackupStatus(): Promise<CategoryBackupStatus[]> {
    const results: CategoryBackupStatus[] = [];

    for (const cat of DB_CATEGORIES) {
      try {
        const service = this.getBackupService(cat.name);
        if (!service) {
          results.push({
            category: cat.name,
            lastBackup: null,
            lastBackupSize: null,
            lastBackupSizeHuman: "0 B",
            backupCount: 0,
            schemas: cat.schemas,
          });
          continue;
        }

        const lastInfo = await service.getLastBackupInfo();
        const backups = await service.listBackups();

        results.push({
          category: cat.name,
          lastBackup: lastInfo.lastBackup,
          lastBackupSize: lastInfo.lastBackupSize,
          lastBackupSizeHuman: formatBytes(lastInfo.lastBackupSize ?? 0),
          backupCount: backups.length,
          schemas: cat.schemas,
        });
      } catch {
        results.push({
          category: cat.name,
          lastBackup: null,
          lastBackupSize: null,
          lastBackupSizeHuman: "0 B",
          backupCount: 0,
          schemas: cat.schemas,
        });
      }
    }

    return results;
  }

  async executeBackup(
    category: string,
    options: { compress?: boolean } = {}
  ): Promise<BackupExecutionResult> {
    const catConfig = DB_CATEGORIES.find((c) => c.name === category);
    if (!catConfig) {
      throw new Error(`Categoria "${category}" não encontrada`);
    }

    const service = this.getBackupService(category);
    if (!service) {
      throw new Error(`Serviço de backup não disponível para ${category}`);
    }

    const result = await service.runBackup(options);

    return {
      category,
      success: true,
      filePath: result.filePath,
      sizeBytes: result.sizeBytes,
      sizeHuman: formatBytes(result.sizeBytes),
      durationMs: result.durationMs,
      schemas: result.schemas,
    };
  }
}
