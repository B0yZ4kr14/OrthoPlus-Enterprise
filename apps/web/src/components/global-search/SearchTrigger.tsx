import { Search } from "lucide-react";

interface SearchTriggerProps {
  onClick: () => void;
}

export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <div className="w-full md:w-64 pl-10 pr-4 py-2 text-sm text-muted-foreground border border-border rounded-md bg-background hover:bg-accent/50 transition-colors">
        Buscar... <kbd className="ml-auto text-xs">⌘K</kbd>
      </div>
    </div>
  );
}
