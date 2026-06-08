import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Check,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { EmptyState } from "./EmptyState";
import * as Lucide from "lucide-react";
import { cn } from "../../lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  skeletonCount?: number;
  // Dynamic features from Part 1.4 spec
  totalCount?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: keyof typeof Lucide;
  // Sort states passed down or managed
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  // Selection
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: any) => void;
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

  // Calculate showing ranges
  const startRange = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show (up to 5 page buttons visible)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(pageCount, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-3.5">
      {/* Table Toolbar: Column visibility, page size selector */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          {onPageSizeChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                Show
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-md border border-input bg-card px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                aria-label="Items per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        {/* Columns Toggle Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 bg-card text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              aria-label="Toggle Column Visibility"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Columns</span>
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[150px] rounded-lg border border-border bg-card p-1 shadow-lg focus:outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Label className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Toggle Columns
              </DropdownMenu.Label>
              <DropdownMenu.Separator className="h-px bg-border my-1" />
              {table
                .getAllLeafColumns()
                .filter((col) => col.getCanHide())
                .map((col) => {
                  const label = typeof col.columnDef.header === "string" 
                    ? col.columnDef.header 
                    : col.id;
                  return (
                    <DropdownMenu.CheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                      className="relative flex items-center justify-between rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
                    >
                      <span>{label}</span>
                      {col.getIsVisible() && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenu.CheckboxItem>
                  );
                })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Table Wrapper with scroll overflow */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead className="sticky top-0 z-10 bg-card text-muted-foreground uppercase tracking-widest font-semibold border-b border-border/60 select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        scope="col"
                        style={{ width: header.getSize() }}
                        className="px-6 py-3 relative group"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            onClick={header.column.getToggleSortingHandler()}
                            className={cn(
                              "flex items-center gap-1.5",
                              isSortable && "cursor-pointer select-none hover:text-foreground"
                            )}
                          >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                            {isSortable && (
                              <span className="shrink-0 text-muted-foreground/60 group-hover:text-foreground transition-colors">
                                {isSorted === "desc" ? (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                ) : isSorted === "asc" ? (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Resize handle */}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none bg-border/40 hover:bg-primary opacity-0 group-hover:opacity-100 transition-opacity",
                              header.column.getIsResizing() && "bg-primary opacity-100"
                            )}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                [...Array(skeletonCount)].map((_, rIdx) => {
                  // Varied skeleton width per column
                  const widths = ["w-1/2", "w-3/4", "w-2/3", "w-5/6", "w-1/3"];
                  return (
                    <tr key={rIdx} className="animate-pulse">
                      {columns.map((_, cIdx) => (
                        <td key={cIdx} className="px-6 py-3.5">
                          <div className={cn("h-4 bg-muted rounded", widths[cIdx % widths.length])}></div>
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center align-middle">
                    <div className="flex justify-center">
                      <EmptyState
                        icon={emptyStateIcon}
                        title={emptyStateTitle}
                        description={emptyStateDescription}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3 text-foreground align-middle overflow-hidden text-ellipsis whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pageCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1.5 select-none">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{startRange}</span>–
            <span className="font-semibold text-foreground">{endRange}</span> of{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> results
          </div>

          {pageCount > 1 && (
            <div className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-all duration-200"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numbered pages */}
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-all duration-200",
                    pageNum === currentPage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= pageCount || isLoading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-all duration-200"
                aria-label="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
