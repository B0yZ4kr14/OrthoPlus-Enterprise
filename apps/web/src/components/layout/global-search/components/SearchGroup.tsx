import { CommandGroup, CommandItem } from "@orthoplus/core-ui/command";
import type { SearchResult } from "../types";

interface SearchGroupProps {
  heading: string;
  results: SearchResult[];
  icon: React.ReactNode;
  onSelect: (url: string) => void;
}

export function SearchGroup({
  heading,
  results,
  icon,
  onSelect,
}: SearchGroupProps) {
  return (
    <CommandGroup heading={heading}>
      {results.map((result) => (
        <CommandItem key={result.id} onSelect={() => onSelect(result.url)}>
          {icon}
          <span>
            {result.title} - {result.subtitle}
          </span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
