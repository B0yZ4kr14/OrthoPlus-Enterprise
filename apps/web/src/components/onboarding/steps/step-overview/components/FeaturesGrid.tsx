import { FEATURES } from "../constants/features";
import { FeatureCard } from "./FeatureCard";

export function FeaturesGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {FEATURES.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  );
}
