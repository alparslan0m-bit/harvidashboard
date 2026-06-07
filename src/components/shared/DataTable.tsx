import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  currentPage,
  onPageChange,
  isLoading,
  skeletonCount = 5,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  return (
    <div className="space-y-4">
      {/* Table Wrapper */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider font-semibold border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} scope="col" className="px-6 py-3.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                // Table Skeleton
                [...Array(skeletonCount)].map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-6 py-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-10 text-center text-muted-foreground">
                    No results found matching selected criteria.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/15 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-3.5 text-foreground align-middle">
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
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2 select-none">
          <div className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
            <span className="font-semibold text-foreground">{pageCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= pageCount || isLoading}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataTable;
