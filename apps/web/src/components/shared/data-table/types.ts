// cspell:disable

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: keyof T;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  initialPageSize?: number;
}
