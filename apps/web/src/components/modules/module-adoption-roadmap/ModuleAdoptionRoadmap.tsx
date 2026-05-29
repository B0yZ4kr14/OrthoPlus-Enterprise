import type { ModuleAdoptionRoadmapProps } from "./types";
import { RoadmapHeader } from "./RoadmapHeader";
import { ClinicProfileAlert } from "./ClinicProfileAlert";
import { InsightsCard } from "./InsightsCard";
import { PhaseCard } from "./PhaseCard";

export function ModuleAdoptionRoadmap({
  recommendation,
  clinicProfile,
  onActivatePhase,
}: ModuleAdoptionRoadmapProps) {
  return (
    <div className="space-y-6">
      <RoadmapHeader />

      {clinicProfile && <ClinicProfileAlert profile={clinicProfile} />}

      {recommendation.insights && (
        <InsightsCard insights={recommendation.insights} />
      )}

      <div className="space-y-4">
        {recommendation.phases?.map((phase, index) => (
          <PhaseCard
            key={index}
            phase={phase}
            index={index}
            isFirst={index === 0}
            onActivate={onActivatePhase}
          />
        ))}
      </div>
    </div>
  );
}
