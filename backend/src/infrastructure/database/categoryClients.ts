import { CategoryBackupService } from "@/infrastructure/database/CategoryBackupService";

const CATEGORY_SCHEMAS: Record<string, string[]> = {
  CORE: ["core", "pacientes", "pep"],
  FINANCEIRO: ["financeiro", "pdv", "faturamento", "crypto_config"],
  OPERACIONAL: ["operacional", "inventario"],
  COMERCIAL: ["comercial"],
  CLINICO: ["clinico"],
  ADMINISTRATIVO: [
    "administrativo",
    "configuracoes",
    "database_admin",
    "backups",
  ],
};

// Lazy-instantiated singletons per category
const backupServiceCache = new Map<string, CategoryBackupService>();

export function getCategoryBackupService(
  category: string,
): CategoryBackupService {
  const key = category.toUpperCase();
  if (!backupServiceCache.has(key)) {
    const schemas = CATEGORY_SCHEMAS[key];
    if (!schemas) {
      throw new Error(
        `Unknown category: ${category}. Valid: ${Object.keys(CATEGORY_SCHEMAS).join(", ")}`,
      );
    }
    backupServiceCache.set(
      key,
      new CategoryBackupService(schemas, key, process.env.DATABASE_URL ?? ""),
    );
  }
  return backupServiceCache.get(key)!;
}
