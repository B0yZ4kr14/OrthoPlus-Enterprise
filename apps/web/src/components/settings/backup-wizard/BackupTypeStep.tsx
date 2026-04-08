import React from "react";
import { Database, Check } from "lucide-react";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { WizardStepProps } from "./types";

export function BackupTypeStep({ config, setConfig }: WizardStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Tipo de Backup</h3>
      </div>

      <div className="space-y-3">
        <Card
          className={`cursor-pointer transition-all ${
            config.backupType === "full" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() =>
            setConfig({
              ...config,
              backupType: "full",
              isIncremental: false,
            })
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {config.backupType === "full" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h4 className="font-semibold">Backup Completo (Full)</h4>
                <p className="text-sm text-muted-foreground">
                  Copia todos os dados do sistema. Ocupa mais espaço mas
                  permite restauração independente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            config.backupType === "incremental" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() =>
            setConfig({
              ...config,
              backupType: "incremental",
              isIncremental: true,
            })
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {config.backupType === "incremental" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h4 className="font-semibold">Backup Incremental</h4>
                <p className="text-sm text-muted-foreground">
                  Copia apenas dados modificados desde o último backup
                  (full ou incremental). Mais rápido e econômico.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            config.backupType === "differential" ? "border-primary bg-primary/5" : ""
          }`}
          onClick={() =>
            setConfig({ ...config, backupType: "differential" })
          }
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {config.backupType === "differential" && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <h4 className="font-semibold">Backup Diferencial</h4>
                <p className="text-sm text-muted-foreground">
                  Copia dados modificados desde o último backup completo.
                  Equilíbrio entre velocidade e facilidade de restauração.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
