import { DependencyAlert } from "./components/DependencyAlert";
import { DependencyMap } from "./components/DependencyMap";
import { ExamplesCard } from "./components/ExamplesCard";
import { ProTipCard } from "./components/ProTipCard";
import { DEPENDENCIES } from "./constants/dependencies";

export { DEPENDENCIES };
export type { Dependency } from "./constants/dependencies";
export { DependencyAlert, DependencyMap, ExamplesCard, ProTipCard };

export function StepDependencies() {
  return (
    <div className="space-y-6">
      <DependencyAlert />
      <DependencyMap dependencies={DEPENDENCIES} />
      <ExamplesCard />
      <ProTipCard />
    </div>
  );
}
