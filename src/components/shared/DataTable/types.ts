import type { ColumnDef, SortingState } from "@tanstack/react-table";
import * as Lucide from "lucide-react";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  skeletonCount?: number;
  totalCount?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateIcon?: keyof typeof Lucide;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: any) => void;
}
