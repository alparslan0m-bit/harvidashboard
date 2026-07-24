import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
}

export function DataTableHeader<TData>({ table }: DataTableHeaderProps<TData>) {
  return (
    <thead className="sticky top-0 z-10 select-none bg-muted/40 text-muted-foreground text-[12px] font-mono uppercase tracking-normal after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-primary/20 after:to-chart-5/20">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="relative">
          {headerGroup.headers.map((header) => {
            const isSortable = header.column.getCanSort();
            const isSorted = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                scope="col"
                style={{ width: header.getSize() }}
                className="px-4 py-2.5 relative group"
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
                      <span className="shrink-0 text-muted-foreground/60 group-hover:text-foreground transition-all duration-300">
                        {isSorted === "desc" ? (
                          <ArrowDown className="h-3.5 w-3.5 text-primary scale-110" />
                        ) : isSorted === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary scale-110" />
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 hover:opacity-100 group-hover:rotate-180" />
                        )}
                      </span>
                    )}
                  </div>
                )}
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
  );
}
