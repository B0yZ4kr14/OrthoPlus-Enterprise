// cspell:disable
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/apiClient";
import { logger } from "@/lib/logger";
import { toast } from "sonner";
import type {
  ScheduledBackupConfig,
  ScheduledBackupWizardProps,
} from "./types";

const DEFAULT_CONFIG: ScheduledBackupConfig = {
  name: "",
  frequency: "daily",
  timeOfDay: "02:00",
  backupType: "full",
  isIncremental: false,
  includeModules: true,
  includePatients: true,
  includeHistory: true,
  includeProntuarios: true,
  includeAppointments: true,
  includeFinanceiro: true,
  includePostgresDB: true,
  enableCompression: true,
  enableEncryption: false,
  cloudStorageProvider: "local",
  notificationEmails: [],
  isActive: true,
};

export function useBackupWizard({
  open,
  onClose,
  initialData,
}: ScheduledBackupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [config, setConfig] = useState<ScheduledBackupConfig>(DEFAULT_CONFIG);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    if (initialData && open) {
      setConfig({
        ...DEFAULT_CONFIG,
        name: initialData.name || "",
        frequency:
          (initialData.frequency as ScheduledBackupConfig["frequency"]) ||
          "daily",
        timeOfDay: initialData.timeOfDay || "02:00",
        dayOfWeek: initialData.dayOfWeek,
        dayOfMonth: initialData.dayOfMonth,
        backupType:
          (initialData.backupType as ScheduledBackupConfig["backupType"]) ||
          "full",
        isIncremental: initialData.isIncremental ?? false,
        includeModules: initialData.includeModules ?? true,
        includePatients: initialData.includePatients ?? true,
        includeHistory: initialData.includeHistory ?? true,
        includeProntuarios: initialData.includeProntuarios ?? true,
        includeAppointments: initialData.includeAppointments ?? true,
        includeFinanceiro: initialData.includeFinanceiro ?? true,
        includePostgresDB: initialData.includePostgresDB ?? true,
        enableCompression: initialData.enableCompression ?? true,
        enableEncryption: initialData.enableEncryption ?? false,
        cloudStorageProvider: initialData.cloudStorageProvider || "local",
        notificationEmails: initialData.notificationEmails || [],
        isActive: initialData.isActive ?? true,
      });
      setStep(1);
    } else if (!open) {
      setStep(1);
      setConfig(DEFAULT_CONFIG);
    }
  }, [initialData, open]);

  const calculateNextExecutions = (
    cfg: ScheduledBackupConfig,
    count = 5,
  ): string[] => {
    const executions: string[] = [];
    const now = new Date();
    const [hours, minutes] = cfg.timeOfDay.split(":").map(Number);

    for (let i = 0; i < count; i++) {
      const nextDate = new Date(now);
      nextDate.setHours(hours, minutes, 0, 0);

      switch (cfg.frequency) {
        case "daily":
          nextDate.setDate(
            nextDate.getDate() + i + (i === 0 && nextDate <= now ? 1 : 0),
          );
          break;
        case "weekly":
          if (cfg.dayOfWeek !== undefined) {
            const daysUntilTarget = (cfg.dayOfWeek - now.getDay() + 7) % 7;
            nextDate.setDate(nextDate.getDate() + daysUntilTarget + i * 7);
            if (i === 0 && nextDate <= now) {
              nextDate.setDate(nextDate.getDate() + 7);
            }
          }
          break;
        case "monthly":
          if (cfg.dayOfMonth !== undefined) {
            nextDate.setDate(cfg.dayOfMonth);
            nextDate.setMonth(nextDate.getMonth() + i);
            if (i === 0 && nextDate <= now) {
              nextDate.setMonth(nextDate.getMonth() + 1);
            }
          }
          break;
      }

      executions.push(nextDate.toLocaleString("pt-BR"));
    }

    return executions;
  };

  useEffect(() => {
    if (step === 6) {
      setNextExecutions(calculateNextExecutions(config));
    }
  }, [step, config]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (initialData?.id) {
        await apiClient.patch(
          `/configuracoes/backups/agendados/${initialData.id}`,
          config,
        );
        toast.success("Backup agendado atualizado com sucesso!");
      } else {
        await apiClient.post("/backups/manager", config);
        toast.success("Backup agendado configurado com sucesso!");
      }
      onClose();
      setStep(1);
    } catch (error) {
      logger.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erro ao configurar backup",
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const updateConfig = (updates: Partial<ScheduledBackupConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return {
    step,
    totalSteps,
    progress,
    loading,
    config,
    nextExecutions,
    nextStep,
    prevStep,
    handleSubmit,
    updateConfig,
  };
}
