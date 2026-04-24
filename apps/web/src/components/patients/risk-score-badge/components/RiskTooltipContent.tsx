interface RiskTooltipContentProps {
  overallScore: number | null;
  medicalScore?: number | null;
  surgicalScore?: number | null;
  anestheticScore?: number | null;
  showDetailed?: boolean;
}

export function RiskTooltipContent({
  overallScore,
  medicalScore,
  surgicalScore,
  anestheticScore,
  showDetailed,
}: RiskTooltipContentProps) {
  return (
    <div className="space-y-2">
      <div className="font-semibold border-b pb-2">
        Score de Risco: {overallScore || 0}/100
      </div>
      {showDetailed && (
        <>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Risco Médico:</span>
              <span className="font-semibold">{medicalScore || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Risco Cirúrgico:</span>
              <span className="font-semibold">{surgicalScore || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Risco Anestésico:</span>
              <span className="font-semibold">{anestheticScore || 0}/100</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Calculado automaticamente com base no histórico médico
          </div>
        </>
      )}
    </div>
  );
}
