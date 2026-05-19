// cspell:disable
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Input } from "@orthoplus/core-ui/input";
import { TableHead, TableHeader, TableRow } from "@orthoplus/core-ui/table";
import type { Column, SortDirection } from "./types";

interface DataTableHeaderProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  searchable: boolean;
  searchTerm: string;
  sortColumn: keyof T | null;
  sortDirection: SortDirection;
  onSearchChange: (value: string) => void;
  onSort: (key: keyof T) => void;
}

export function DataTableHeader<T extends Record<string, unknown>>({
  columns,
  searchable,
  searchTerm,
  sortColumn,
  sortDirection,
  onSearchChange,
  onSort,
}: DataTableHeaderProps<T>) {
  return (
    <TableHeader>
      {searchable && (
        <TableRow>
          <TableHead
            colSpan={columns.length}
            className="p-4 border-b-0 bg-muted/50"
          >
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                aria-label="Buscar na tabela"
              />
            </div>
          </TableHead>
        </TableRow>
      )}
      <TableRow>
        {columns.map((column) => (
          <TableHead
            key={String(column.key)}
            scope="col"
            className={column.sortable ? "cursor-pointer select-none" : ""}
            onClick={() => column.sortable && onSort(column.key)}
            aria-sort={
              column.sortable && sortColumn === column.key
                ? sortDirection === "asc"
                  ? "ascending"
                  : "descending"
                : undefined
            }
            aria-label={column.sortable ? `${String(column.header)} — Clique para ordenar` : undefined}
          >
            <div className="flex items-center gap-1">
              {column.header}
              {column.sortable && sortColumn === column.key && (
                <span className="inline-flex" aria-hidden="true">
                  {sortDirection === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
