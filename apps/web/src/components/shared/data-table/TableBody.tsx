// cspell:disable
import { TableBody, TableCell, TableRow } from "@orthoplus/core-ui/table";
import { Inbox } from "lucide-react";
import type { Column } from "./types";

interface DataTableBodyProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
}

function getRowKey<T extends Record<string, unknown>>(
  row: T,
  index: number,
): string {
  const id = row.id;
  if (typeof id === "string" || typeof id === "number") return String(id);
  const _id = row._id;
  if (typeof _id === "string" || typeof _id === "number") return String(_id);
  return `row-${index}`;
}

export function DataTableBody<T extends Record<string, unknown>>({
  data,
  columns,
}: DataTableBodyProps<T>) {
  return (
    <TableBody>
      {data.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-32 text-center text-muted-foreground"
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <Inbox className="h-8 w-8 opacity-50" />
              <span>Nenhum resultado encontrado</span>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        data.map((row, index) => (
          <TableRow key={getRowKey(row, index)}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>{column.cell(row)}</TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  );
}
