import { formatDateTime } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronDown, ChevronUp, Mail } from "lucide-react";

export interface FeedbackColumnsParams {
  selectedIds: Set<string>;
  expandedRowId: string | null;
  toggleSelection: (id: string) => void;
  handleToggleExpand: (id: string) => void;
  handleStatusUpdate: (id: string, newStatus: string) => void;
  setDeleteId: (id: string) => void;
}

export function createFeedbackColumns({
  selectedIds,
  expandedRowId,
  toggleSelection,
  handleToggleExpand,
  handleStatusUpdate,
  setDeleteId,
}: FeedbackColumnsParams): ColumnDef<any>[] {
  return [
    {
      id: "selector",
      header: "",
      cell: ({ row }) => {
        if (row.original.isExpansionRow) return null;
        return (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleSelection(row.original.id)}
            className="h-3.5 w-3.5 rounded border-input accent-primary cursor-pointer"
            aria-label="Select feedback item"
          />
        );
      },
    },
    {
      id: "expander",
      header: "",
      cell: ({ row }) => {
        if (row.original.isExpansionRow) return null;
        const isExpanded = expandedRowId === row.original.id;
        return (
          <button
            onClick={() => handleToggleExpand(row.original.id)}
            className="p-1 rounded hover:bg-accent text-muted-foreground transition"
            aria-label={isExpanded ? "Collapse row" : "Expand row"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        );
      },
    },
    {
      accessorKey: "userEmail",
      header: "Student User",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground select-all">{row.original.userEmail}</span>
      ),
    },
    {
      accessorKey: "content",
      header: "Feedback Message Preview",
      cell: ({ row }) => {
        const preview =
          row.original.content.length > 80
            ? `${row.original.content.substring(0, 80)}...`
            : row.original.content;
        return <span className="text-foreground leading-relaxed">{preview}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <select
          value={row.original.status}
          onChange={(e) => handleStatusUpdate(row.original.id, e.target.value as any)}
          className="rounded border border-input bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground outline-none transition cursor-pointer capitalize"
          aria-label="Change feedback status"
        >
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
          <option value="archived">Archived</option>
        </select>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDateTime(row.original.created_at)}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        if (row.original.isExpansionRow) return null;
        return (
          <div className="flex gap-2">
            {row.original.userEmail && row.original.userEmail !== "N/A" && (
              <a
                href={`mailto:${row.original.userEmail}?subject=Re: Your Feedback&body=Hi,%0A%0AThank you for your feedback.%0A%0ARegarding your message:%0A"${encodeURIComponent(row.original.content?.substring(0, 100) || "")}"%0A%0A`}
                className="p-1.5 rounded border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
                aria-label="Reply via email"
                title="Reply via email"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              onClick={() => setDeleteId(row.original.id)}
              className="p-1.5 rounded border border-destructive/20 text-destructive hover:bg-destructive/10 transition"
              aria-label="Delete feedback log"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];
}

export function applyExpansionColumnOverrides(columns: ColumnDef<any>[]): ColumnDef<any>[] {
  return columns.map((col) => ({
    ...col,
    cell: (cellContext) => {
      const rowData = cellContext.row.original;
      if (rowData.isExpansionRow) {
        if (col.id === "expander" || col.id === "selector") return null;
        if ("accessorKey" in col && col.accessorKey === "content") {
          const hasMetadata = Object.keys(rowData.metadata || {}).length > 0;
          return (
            <div className="col-span-full py-4 space-y-4 text-xs select-none animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="bg-muted/30 border border-dashed p-4 rounded-lg leading-relaxed text-foreground select-text whitespace-pre-wrap">
                {rowData.content}
              </div>

              {hasMetadata && (
                <div className="bg-muted/10 border p-3 rounded-lg space-y-1">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Submission Context (Metadata)
                  </span>
                  <pre className="text-[10px] font-mono text-muted-foreground select-text overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(rowData.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        }
        return null;
      }
      return (col.cell as any)(cellContext);
    },
  }));
}
