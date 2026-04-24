import { FeaturesGrid } from "./components/FeaturesGrid";
import { ObjectiveCard } from "./components/ObjectiveCard";
import { OverviewDescription } from "./components/OverviewDescription";

export { FEATURES, type Feature } from "./constants/features";
export { FeaturesGrid, ObjectiveCard, OverviewDescription };

export function StepOverview() {
  return (
    <div className="space-y-6">
      <OverviewDescription />
      <FeaturesGrid />
      <ObjectiveCard />
    </div>
  );
}
