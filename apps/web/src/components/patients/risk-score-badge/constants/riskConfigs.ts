import { AlertTriangle, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import type { RiskConfig } from "../types";

export const RISK_CONFIGS: Record<string, RiskConfig> = {
  critico: {
    icon: AlertTriangle,
    label: "Risco Crítico",
    className: "bg-destructive/10 text-destructive border-destructive/30",
    color: "text-destructive",
  },
  alto: {
    icon: ShieldAlert,
    label: "Risco Alto",
    className: "bg-warning/10 text-warning border-warning/30",
    color: "text-warning",
  },
  moderado: {
    icon: Shield,
    label: "Risco Moderado",
    className: "bg-info/10 text-info border-info/30",
    color: "text-info",
  },
  baixo: {
    icon: ShieldCheck,
    label: "Risco Baixo",
    className: "bg-success/10 text-success border-success/30",
    color: "text-success",
  },
};

export const DEFAULT_RISK_CONFIG = RISK_CONFIGS.baixo;
