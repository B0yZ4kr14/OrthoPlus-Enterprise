import { CommandGroup, CommandItem } from "@orthoplus/core-ui/command";
import { useNavigate } from "react-router-dom";
import type { SearchResult } from "./types";

interface SearchResultsProps {
  results: SearchResult[];
  type: "patient" | "appointment" | "procedure";
  title: string;
  onSelect: () => void;
}

export function SearchResultsGroup({
  results,
  type,
  title,
  onSelect,
}: SearchResultsProps) {
  const navigate = useNavigate();
  const filtered = results.filter((r) => r.type === type);

  if (filtered.length === 0) return null;

  return (
    <CommandGroup heading={title}>
      {filtered.map((result) => {
        const Icon = result.icon;
        return (
          <CommandItem
            key={result.id}
            onSelect={() => {
              navigate(result.route);
              onSelect();
            }}
          >
            <Icon className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>{result.title}</span>
              <span className="text-xs text-muted-foreground">
                {result.subtitle}
              </span>
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}
