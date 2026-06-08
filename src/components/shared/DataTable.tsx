import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { DataTableProps } from "./DataTable/types";
import { useDataTablePagination } from "./DataTable/useDataTablePagination";
import { DataTableToolbar } from "./DataTable/DataTableToolbar";
import { DataTableHeader } from "./DataTable/DataTableHeader";
import { DataTableBody } from "./DataTable/DataTableBody";
import { DataTablePagination } from "./DataTable/DataTablePagination";

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  currentPage,
  onPageChange,
  isLoading,
  skeletonCount = 5,
  totalCount = 0,
  pageSize = 25,
  onPageSizeChange,
  emptyStateTitle = "No data available",
  emptyStateDescription = "Try adjusting your filters or search terms.",
  emptyStateIcon = "Inbox",
  sorting,
  onSortingChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    state: {
      columnVisibility,
      sorting,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: onSortingChange as any,
    onRowSelectionChange: onRowSelectionChange,
    enableRowSelection: !!onRowSelectionChange,
  });

  const { startRange, endRange, getPageNumbers } = useDataTablePagination(
    currentPage,
    pageCount,
    pageSize,
    totalCount
  );

  return (
    <div className="space-y-3.5">
      <DataTableToolbar
        table={table}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse relative">
            <DataTableHeader table={table} />
            <DataTableBody
              table={table}
              columns={columns}
              data={data}
              isLoading={isLoading}
              skeletonCount={skeletonCount}
              emptyStateTitle={emptyStateTitle}
              emptyStateDescription={emptyStateDescription}
              emptyStateIcon={emptyStateIcon}
            />
          </table>
        </div>
      </div>

      <DataTablePagination
        currentPage={currentPage}
        pageCount={pageCount}
        isLoading={isLoading}
        onPageChange={onPageChange}
        startRange={startRange}
        endRange={endRange}
        totalCount={totalCount}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}

export default DataTable;
