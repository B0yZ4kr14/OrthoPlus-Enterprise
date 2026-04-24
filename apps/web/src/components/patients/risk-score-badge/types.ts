export interface RiskScoreBadgeProps {
  riskLevel: string | null;
  overallScore: number | null;
  medicalScore?: number | null;
  surgicalScore?: number | null;
  anestheticScore?: number | null;
  showDetailed?: boolean;
}

export interface RiskConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className: string;
  color: string;
}

export interface RiskTooltipContentProps {
  overallScore: number | null;
  medicalScore?: number | null;
  surgicalScore?: number | null;
  anestheticScore?: number | null;
  showDetailed?: boolean;
}
