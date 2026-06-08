import React, { useState, useMemo, useCallback } from "react";
import { useFeedback, useFeedbackMutations } from "../hooks/useFeedback";
import { DataTable } from "../components/shared/DataTable";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { ErrorView } from "../components/shared/ErrorView";
import { formatDateTime } from "../lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, ChevronDown, ChevronUp, Mail, Archive, CheckCheck } from "lucide-react";

export const Feedback: React.FC = () => {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // all, new, read, resolved, archived
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error, unreadCount, refetch } = useFeedback(page, activeTab);
  const { updateStatus, deleteFeedback } = useFeedbackMutations(page, activeTab);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setExpandedRowId(null);
    setSelectedIds(new Set());
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFeedback(deleteId);
      setDeleteId(null);
      if (expandedRowId === deleteId) {
        setExpandedRowId(null);
      }
    }
  };

  const handleStatusUpdate = useCallback(
    async (id: string, newStatus: any) => {
      await updateStatus({ id, status: newStatus });
    },
    [updateStatus]
  );

  // Toggle selection for bulk actions
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Bulk archive selected
  const handleBulkArchive = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      updateStatus({ id, status: "archived" })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
  }, [selectedIds, updateStatus]);

  // Bulk mark as read
  const handleBulkMarkRead = useCallback(async () => {
    const promises = Array.from(selectedIds).map((id) =>
      updateStatus({ id, status: "read" })
    );
    await Promise.all(promises);
    setSelectedIds(new Set());
  }, [selectedIds, updateStatus]);

  // Define Columns
  const columns: ColumnDef<any>[] = useMemo(
    () => [
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
        cell: ({ row }) => <span className="font-semibold text-foreground select-all">{row.original.userEmail}</span>,
      },
      {
        accessorKey: "content",
        header: "Feedback Message Preview",
        cell: ({ row }) => {
          const preview = row.original.content.length > 80
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
        cell: ({ row }) => <span className="text-muted-foreground">{formatDateTime(row.original.created_at)}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (row.original.isExpansionRow) return null;
          return (
            <div className="flex gap-2">
              {/* Mailto reply pre-fill */}
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
    ],
    [expandedRowId, selectedIds, handleToggleExpand, handleStatusUpdate, toggleSelection]
  );

  if (error) {
    return (
      <ErrorView
        title="Failed to load Feedback logs"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  // Inject expanded row content directly into custom display wrapper
  const tableDataWithExpansions = (data?.feedbackList || []).flatMap((item) => {
    if (expandedRowId === item.id) {
      return [
        item,
        {
          id: `${item.id}-expansion`,
          isExpansionRow: true,
          content: item.content,
          metadata: item.metadata,
        },
      ];
    }
    return [item];
  });

  // Custom columns logic mapping expansion row rendering overrides
  const customColumns: ColumnDef<any>[] = columns.map((col) => {
    return {
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
                    <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider block">Submission Context (Metadata)</span>
                    <pre className="text-[10px] font-mono text-muted-foreground select-text overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(rowData.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          }
          return null; // hide other cells in expanded row
        }
        return (col.cell as any)(cellContext);
      },
    };
  });

  const TABS = [
    { id: "all", name: "All Feedback" },
    { id: "new", name: "New", count: unreadCount },
    { id: "read", name: "Read" },
    { id: "resolved", name: "Resolved" },
    { id: "archived", name: "Archived" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Log"
        description="Process, audit, and archive reports submitted by students"
        actions={
          selectedIds.size > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleBulkMarkRead}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-[11px] font-semibold text-foreground hover:bg-accent transition"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark Read</span>
              </button>
              <button
                onClick={handleBulkArchive}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-[11px] font-semibold text-foreground hover:bg-accent transition"
              >
                <Archive className="h-3.5 w-3.5" />
                <span>Archive</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Filter tabs */}
      <div className="flex border-b border-border/80 select-none overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all relative flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{tab.name}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="h-4 px-1.5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TanStack Table */}
      <DataTable
        columns={customColumns}
        data={tableDataWithExpansions}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Deletion dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete feedback log entry?"
        description="This will permanently delete this report. This action is fully destructive and cannot be undone."
        confirmText="Delete Report"
        variant="destructive"
      />
    </div>
  );
};
export default Feedback;
