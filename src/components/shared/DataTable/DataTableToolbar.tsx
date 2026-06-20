import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { SlidersHorizontal, Check } from "lucide-react";
import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
}

export function DataTableToolbar<TData>({
  table,
  pageSize,
  onPageSizeChange,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wide">
              Show
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-input bg-card px-2.5 py-1.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border/60 bg-card text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-ring"
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
            <DropdownMenu.Label className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Toggle Columns
            </DropdownMenu.Label>
            <DropdownMenu.Separator className="h-px bg-border my-1" />
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((col) => {
                const label =
                  typeof col.columnDef.header === "string"
                    ? col.columnDef.header
                    : col.id;
                return (
                  <DropdownMenu.CheckboxItem
                    key={col.id}
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    className="relative flex items-center justify-between rounded px-2.5 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
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
  );
}
