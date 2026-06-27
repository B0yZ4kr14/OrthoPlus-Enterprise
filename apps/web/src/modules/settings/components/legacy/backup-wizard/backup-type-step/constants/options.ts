import type { BackupOption } from "../types";

export const BACKUP_OPTIONS: BackupOption[] = [
  {
    value: "full",
    title: "Backup Completo (Full)",
    description:
      "Copia todos os dados do sistema. Ocupa mais espaço mas permite restauração independente.",
    isIncremental: false,
  },
  {
    value: "incremental",
    title: "Backup Incremental",
    description:
      "Copia apenas dados modificados desde o último backup (full ou incremental). Mais rápido e econômico.",
    isIncremental: true,
  },
  {
    value: "differential",
    title: "Backup Diferencial",
    description:
      "Copia dados modificados desde o último backup completo. Equilíbrio entre velocidade e facilidade de restauração.",
  },
];
