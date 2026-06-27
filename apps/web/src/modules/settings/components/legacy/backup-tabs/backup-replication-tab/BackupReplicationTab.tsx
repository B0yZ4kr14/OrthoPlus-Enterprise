import { LoadingState } from "@/components/shared/LoadingState";
import { useReplications } from "./useReplications";
import { StatsGrid } from "./StatsGrid";
import { ReplicationHistory } from "./ReplicationHistory";

export function BackupReplicationTab() {
  const { replications, stats, isLoading } = useReplications();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <ReplicationHistory replications={replications || []} />
    </div>
  );
}
