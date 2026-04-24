import { Alert, AlertDescription } from "@orthoplus/core-ui/alert";
import { TrendingUp } from "lucide-react";
import type { ClinicProfile } from "./types";

interface ClinicProfileAlertProps {
  profile: ClinicProfile;
}

export function ClinicProfileAlert({ profile }: ClinicProfileAlertProps) {
  return (
    <Alert className="border-primary/30 bg-primary/5">
      <TrendingUp className="h-4 w-4 text-primary" />
      <AlertDescription>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Pacientes:</span>
            <span className="ml-2 font-semibold">{profile.patient_count}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Dias de uso:</span>
            <span className="ml-2 font-semibold">{profile.days_since_creation}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Módulos ativos:</span>
            <span className="ml-2 font-semibold">{profile.active_modules_count}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Disponíveis:</span>
            <span className="ml-2 font-semibold">{profile.inactive_modules_count}</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
