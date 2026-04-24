// cspell:disable
import { TableBody, TableCell, TableRow } from "@orthoplus/core-ui/table";
import { Inbox } from "lucide-react";
import type { Column } from "./types";

interface DataTableBodyProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
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
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.cell(row)}
              </TableCell>
            ))}
          </TableRow>
        ))
      )}
    </TableBody>
  );
}
