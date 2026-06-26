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

function getColumnVisibilityStorageKey<TData>(
  columns: DataTableProps<TData>["columns"],
  storageKey?: string
): string {
  if (storageKey) return `datatable_visibility_${storageKey}`;

  const key = columns
    .map((col) => {
      if (typeof col === "object" && col !== null) {
        if ("id" in col && col.id) return String(col.id);
        if ("accessorKey" in col && col.accessorKey) return String(col.accessorKey);
        if (typeof col.header === "string") return col.header;
      }
      return "";
    })
    .filter(Boolean)
    .join("_");

  return key ? `datatable_visibility_${key}` : "";
}

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
  storageKey,
}: DataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(() => {
    const key = getColumnVisibilityStorageKey(columns, storageKey);
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved column visibility", e);
        }
      }
    }
    return {};
  });

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
    onColumnVisibilityChange: (updaterOrValue) => {
      setColumnVisibility((old) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(old)
            : updaterOrValue;
        const key = getColumnVisibilityStorageKey(columns, storageKey);
        if (key) {
          localStorage.setItem(key, JSON.stringify(next));
        }
        return next;
      });
    },
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
    <div className="space-y-3">
      <div className="rounded-[8px] border border-border bg-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <DataTableToolbar
            table={table}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
          />
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-sm border-collapse relative">
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
