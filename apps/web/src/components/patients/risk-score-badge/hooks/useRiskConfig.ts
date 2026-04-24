import { useMemo } from "react";
import { RISK_CONFIGS, DEFAULT_RISK_CONFIG } from "../constants/riskConfigs";
import type { RiskConfig } from "../types";

export function useRiskConfig(riskLevel: string | null): RiskConfig {
  return useMemo(() => {
    return RISK_CONFIGS[riskLevel || "baixo"] || DEFAULT_RISK_CONFIG;
  }, [riskLevel]);
}
