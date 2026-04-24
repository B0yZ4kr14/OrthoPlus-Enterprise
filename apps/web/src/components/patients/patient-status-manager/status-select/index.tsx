import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@orthoplus/core-ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@orthoplus/core-ui/popover";
import {
  STATUS_LABELS,
} from "@/types/patient-status";
import type { StatusSelectProps, PatientStatus } from "./types";
import { useStatusSelect } from "./hooks/useStatusSelect";
import { StatusTrigger } from "./components/StatusTrigger";
import { StatusOption } from "./components/StatusOption";

export * from "./types";
export { StatusBadge } from "./components/StatusBadge";
export { StatusTrigger } from "./components/StatusTrigger";
export { StatusOption } from "./components/StatusOption";
export { useStatusSelect };

export function StatusSelect({
  currentStatus,
  selectedStatus,
  disabled,
  onSelect,
}: StatusSelectProps) {
  const { open, setOpen, handleSelect } = useStatusSelect(onSelect);
  const allStatuses = Object.keys(STATUS_LABELS) as PatientStatus[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <StatusTrigger selectedStatus={selectedStatus} disabled={disabled} />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar status..." />
          <CommandEmpty>Nenhum status encontrado.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {allStatuses.map((status) => (
              <StatusOption
                key={status}
                status={status}
                selectedStatus={selectedStatus}
                currentStatus={currentStatus}
                onSelect={handleSelect}
              />
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
