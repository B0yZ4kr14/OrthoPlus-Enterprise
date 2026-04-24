import { CheckCircle, XCircle, Info } from "lucide-react";
import type { PasswordStrength } from "./types";

interface RequirementsListProps {
  requirements: PasswordStrength["requirements"];
}

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
      )}
      <span className={met ? "text-foreground font-medium" : "text-muted-foreground"}>
        {children}
      </span>
    </li>
  );
}

export function RequirementsList({ requirements }: RequirementsListProps) {
  return (
    <div className="space-y-1.5 p-3 bg-muted/30 rounded-lg border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground">Requisitos de Segurança</p>
      </div>

      <ul className="space-y-1">
        <Requirement met={requirements.length}>Mínimo 12 caracteres</Requirement>
        <Requirement met={requirements.uppercase}>
          Pelo menos uma letra maiúscula (A-Z)
        </Requirement>
        <Requirement met={requirements.lowercase}>
          Pelo menos uma letra minúscula (a-z)
        </Requirement>
        <Requirement met={requirements.number}>Pelo menos um número (0-9)</Requirement>
        <Requirement met={requirements.symbol}>
          Pelo menos um símbolo (@$!%*?&#)
        </Requirement>
      </ul>
    </div>
  );
}
