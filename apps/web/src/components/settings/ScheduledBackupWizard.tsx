import { useState, useEffect } from "react";
import { Button } from "@orthoplus/core-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@orthoplus/core-ui/dialog";
import { Label } from "@orthoplus/core-ui/label";
import { Input } from "@orthoplus/core-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orthoplus/core-ui/select";
import { Checkbox } from "@orthoplus/core-ui/checkbox";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { Badge } from "@orthoplus/core-ui/badge";
import { Progress } from "@orthoplus/core-ui/progress";
import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  Database,
  Cloud,
  Mail,
} from "lucide-react";

import { ScheduledBackupConfig } from "./backup-wizard/types";
import { BasicInfoStep } from "./backup-wizard/BasicInfoStep";
import { BackupTypeStep } from "./backup-wizard/BackupTypeStep";
import { DataToIncludeStep } from "./backup-wizard/DataToIncludeStep";
import { AdvancedOptionsStep } from "./backup-wizard/AdvancedOptionsStep";
import { DestinationStep } from "./backup-wizard/DestinationStep";
import { SummaryStep } from "./backup-wizard/SummaryStep";

interface ApiScheduledBackupConfig {
  id?: string;
  time_of_day?: string;
  day_of_week?: number;
  day_of_month?: number;
  backup_type?: "full" | "incremental" | "differential";
  is_incremental?: boolean;
  include_modules?: boolean;
  include_patients?: boolean;
  include_clinical_history?: boolean;
  include_prontuarios?: boolean;
  include_appointments?: boolean;
  include_financial?: boolean;
  include_postgres_db?: boolean;
  compression_enabled?: boolean;
  encryption_enabled?: boolean;
  cloud_storage_provider?:
    | "s3"
    | "google_drive"
    | "dropbox"
    | "ftp"
    | "storj"
    | "local"
    | "none";
  local_path?: string;
  notification_emails?: string[];
  enabled?: boolean;
}

interface ScheduledBackupWizardProps {
  open: boolean;
  onClose: () => void;
  initialData?: Partial<ScheduledBackupConfig> &
    Partial<ApiScheduledBackupConfig>;
}

export function ScheduledBackupWizard({
  open,
  onClose,
  initialData,
}: ScheduledBackupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);

  const [config, setConfig] = useState<ScheduledBackupConfig>({
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
  });

  useEffect(() => {
    if (initialData && open) {
      setConfig({
        name: initialData.name || "",
        frequency: initialData.frequency || "daily",
        timeOfDay: initialData.time_of_day || initialData.timeOfDay || "02:00",
        dayOfWeek:
          initialData.day_of_week !== undefined
            ? initialData.day_of_week
            : initialData.dayOfWeek,
        dayOfMonth:
          initialData.day_of_month !== undefined
            ? initialData.day_of_month
            : initialData.dayOfMonth,
        backupType: initialData.backup_type || initialData.backupType || "full",
        isIncremental:
          initialData.is_incremental ?? initialData.isIncremental ?? false,
        includeModules:
          initialData.include_modules ?? initialData.includeModules ?? true,
        includePatients:
          initialData.include_patients ?? initialData.includePatients ?? true,
        includeHistory:
          initialData.include_clinical_history ??
          initialData.includeHistory ??
          true,
        includeProntuarios:
          initialData.include_prontuarios ??
          initialData.includeProntuarios ??
          true,
        includeAppointments:
          initialData.include_appointments ??
          initialData.includeAppointments ??
          true,
        includeFinanceiro:
          initialData.include_financial ??
          initialData.includeFinanceiro ??
          true,
        includePostgresDB:
          initialData.include_postgres_db ??
          initialData.includePostgresDB ??
          true,
        enableCompression:
          initialData.compression_enabled ??
          initialData.enableCompression ??
          true,
        enableEncryption:
          initialData.encryption_enabled ??
          initialData.enableEncryption ??
          false,
        cloudStorageProvider:
          initialData.cloud_storage_provider ||
          initialData.cloudStorageProvider ||
          "local",
        localPath: initialData.local_path || initialData.localPath || "",
        notificationEmails:
          initialData.notification_emails ||
          initialData.notificationEmails ||
          [],
        isActive: initialData.enabled ?? initialData.isActive ?? true,
      });
      setStep(1);
    } else if (!open) {
      // Reset state when closed
      setStep(1);
      setConfig({
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
      });
    }
  }, [initialData, open]);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const calculateNextExecutions = (cfg: ScheduledBackupConfig, count = 5) => {
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
      toast.error("Erro inesperado");
      toast.error(
        error instanceof Error ? error.message : "Erro ao configurar backup",
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(Math.min(step + 1, totalSteps));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData
              ? "Editar Backup Agendado"
              : "Configurar Backup Agendado"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Altere as configurações do backup automático"
              : "Configure backups automáticos para sua clínica"}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        {step === 1 && <BasicInfoStep config={config} setConfig={setConfig} />}
        {step === 2 && <BackupTypeStep config={config} setConfig={setConfig} />}
        {step === 3 && (
          <DataToIncludeStep config={config} setConfig={setConfig} />
        )}
        {step === 4 && (
          <AdvancedOptionsStep config={config} setConfig={setConfig} />
        )}
        {step === 5 && (
          <DestinationStep config={config} setConfig={setConfig} />
        )}
        {step === 6 && (
          <SummaryStep
            config={config}
            setConfig={setConfig}
            nextExecutions={nextExecutions}
          />
        )}

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {step < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Próximo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading || !config.name}>
              {loading ? "Configurando..." : "Confirmar e Ativar"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
