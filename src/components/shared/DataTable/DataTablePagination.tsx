import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  startRange: number;
  endRange: number;
  totalCount: number;
  getPageNumbers: () => number[];
}

export function DataTablePagination({
  currentPage,
  pageCount,
  isLoading,
  onPageChange,
  startRange,
  endRange,
  totalCount,
  getPageNumbers,
}: DataTablePaginationProps) {
  if (pageCount <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1.5 select-none">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startRange}</span>–
        <span className="font-semibold text-foreground">{endRange}</span> of{" "}
        <span className="font-semibold text-foreground">{totalCount}</span> results
      </div>

      {pageCount > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-all duration-200"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-all duration-200",
                pageNum === currentPage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pageCount || isLoading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50 transition-all duration-200"
            aria-label="Next Page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
