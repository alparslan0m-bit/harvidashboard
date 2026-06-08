import { flexRender, type ColumnDef, type Table } from "@tanstack/react-table";
import * as Lucide from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  skeletonCount: number;
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateIcon: keyof typeof Lucide;
}

export function DataTableBody<TData>({
  table,
  columns,
  data,
  isLoading,
  skeletonCount,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon,
}: DataTableBodyProps<TData>) {
  return (
    <tbody className="divide-y divide-border/60">
      {isLoading ? (
        [...Array(skeletonCount)].map((_, rIdx) => {
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
              <td
                key={cell.id}
                className="px-6 py-3 text-foreground align-middle overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))
      )}
    </tbody>
  );
}
