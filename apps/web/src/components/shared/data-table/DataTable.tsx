// cspell:disable
import { Table } from "@orthoplus/core-ui/table";
import { Card, CardContent } from "@orthoplus/core-ui/card";
import { useDataTable } from "./useDataTable";
import { DataTableHeader } from "./TableHeader";
import { DataTableBody } from "./TableBody";
import { DataTableFooter } from "./TableFooter";
import type { DataTableProps } from "./types";

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchKeys = [],
  initialPageSize = 10,
}: DataTableProps<T>) {
  const {
    paginatedData,
    totalPages,
    currentPage,
    pageSize,
    searchTerm,
    sortColumn,
    sortDirection,
    setSearchTerm,
    setPageSize,
    handleSort,
    handlePageChange,
  } = useDataTable(data, searchable, searchKeys, initialPageSize);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <DataTableHeader
            columns={columns}
            searchable={searchable}
            searchTerm={searchTerm}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSearchChange={setSearchTerm}
            onSort={handleSort}
          />
          <DataTableBody data={paginatedData} columns={columns} />
        </Table>
      </CardContent>
      <DataTableFooter
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={data.length}
        onPageChange={handlePageChange}
        onPageSizeChange={setPageSize}
      />
    </Card>
  );
}
