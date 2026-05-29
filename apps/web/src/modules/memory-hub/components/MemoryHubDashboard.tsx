import { MemoryHubSearch } from "./MemoryHubSearch";
import { MemoryHubHealth } from "./MemoryHubHealth";

export function MemoryHubDashboard() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Memory Hub</h1>
        <p className="text-muted-foreground">
          Search and monitor project knowledge
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Health Overview</h2>
        <MemoryHubHealth />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Semantic Search</h2>
        <MemoryHubSearch />
      </section>
    </div>
  );
}
