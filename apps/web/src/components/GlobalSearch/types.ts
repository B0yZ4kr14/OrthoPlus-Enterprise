import type { SearchResultItem } from "@orthoplus/shared-types";
import type { LucideIcon } from "lucide-react";

export interface ModuleConfig {
  label: string;
  icon: LucideIcon;
  badgeVariant: "info" | "success" | "warning" | "secondary" | "default";
  getRoute: (item: SearchResultItem) => string;
}

export interface GroupedResults {
  [module: string]: SearchResultItem[];
}

export interface UseGlobalSearchReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  results: SearchResultItem[];
  groupedResults: GroupedResults;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  total: number;
}
