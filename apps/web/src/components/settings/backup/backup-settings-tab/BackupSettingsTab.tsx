import { Button } from "@orthoplus/core-ui/button";
import { ScheduleCard } from "./ScheduleCard";
import { RetentionCard } from "./RetentionCard";
import { StorageCard } from "./StorageCard";

export function BackupSettingsTab() {
  return (
    <div className="space-y-4">
      <ScheduleCard />
      <RetentionCard />
      <StorageCard />
      <Button className="w-full">Salvar Configurações</Button>
    </div>
  );
}
