import { Badge } from "@orthoplus/core-ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@orthoplus/core-ui/tooltip";
import type { RiskScoreBadgeProps } from "./types";
import { useRiskConfig } from "./hooks/useRiskConfig";
import { RiskTooltipContent } from "./components/RiskTooltipContent";

export * from "./types";
export { RiskTooltipContent };
export { useRiskConfig };
export { RISK_CONFIGS, DEFAULT_RISK_CONFIG } from "./constants/riskConfigs";

export function RiskScoreBadge({
  riskLevel,
  overallScore,
  medicalScore,
  surgicalScore,
  anestheticScore,
  showDetailed = false,
}: RiskScoreBadgeProps) {
  const config = useRiskConfig(riskLevel);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${config.className} gap-1.5 cursor-help`}>
            <Icon className="h-3 w-3" />
            {config.label}
            {overallScore !== null && (
              <span className="font-mono">{overallScore}</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <RiskTooltipContent
            overallScore={overallScore}
            medicalScore={medicalScore}
            surgicalScore={surgicalScore}
            anestheticScore={anestheticScore}
            showDetailed={showDetailed}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
