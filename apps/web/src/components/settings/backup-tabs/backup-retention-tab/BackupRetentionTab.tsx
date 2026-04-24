import { useRetention } from "./useRetention";
import { RetentionConfigCard } from "./RetentionConfigCard";
import { CleanupCard } from "./CleanupCard";

export function BackupRetentionTab() {
  const {
    retentionDays,
    autoCleanup,
    setRetentionDays,
    setAutoCleanup,
    updateMutation,
    cleanupMutation,
  } = useRetention();

  return (
    <div className="space-y-6">
      <RetentionConfigCard
        retentionDays={retentionDays}
        autoCleanup={autoCleanup}
        onRetentionChange={setRetentionDays}
        onAutoCleanupChange={setAutoCleanup}
        onSave={() => updateMutation.mutate()}
        isPending={updateMutation.isPending}
      />
      <CleanupCard
        onCleanup={() => cleanupMutation.mutate()}
        isPending={cleanupMutation.isPending}
      />
    </div>
  );
}
