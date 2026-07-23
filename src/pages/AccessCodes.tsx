import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PageHeader } from "@/components/shared/PageHeader";
import { ErrorView } from "@/components/shared/ErrorView";
import { KPIGrid } from "@/components/shared/KPIGrid";
import { FilterBar } from "@/components/shared/FilterBar";
import { DataTable } from "@/components/shared/DataTable";
import { useAccessCodes, useGenerateAccessCodes, useDeleteAccessCode, useDeleteMultipleAccessCodes } from "@/hooks/useAccessCodes";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { AccessCodeWithDetails } from "@/types/database";
import { toast } from "sonner";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Tag,
  BookOpen,
  Trash2,
} from "lucide-react";

export const AccessCodes: React.FC = () => {
  const [selectedModuleFilter, setSelectedModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchSearch, setBatchSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState("");
  const [codeCount, setCodeCount] = useState(50);
  const [expiresDays, setExpiresDays] = useState<number | "">(365);

  // Generated Result Modal
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [generatedModuleName, setGeneratedModuleName] = useState("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Fetch modules list for dropdown
  const { data: modules = [] } = useQuery({
    queryKey: ["accessCodesModulesList"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("modules")
        .select("id, name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });

  const { accessCodes, isLoading, error, refetch } = useAccessCodes(
    selectedModuleFilter,
    statusFilter,
    batchSearch,
  );

  const pageSize = 15;
  const totalPages = Math.ceil(accessCodes.length / pageSize) || 1;
  const paginatedData = accessCodes.slice((page - 1) * pageSize, page * pageSize);

  const generateMutation = useGenerateAccessCodes();
  const deleteMutation = useDeleteAccessCode();
  const bulkDeleteMutation = useDeleteMultipleAccessCodes();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this access code?")) {
      await deleteMutation.mutateAsync(id);
      const next = new Set(selectedIds);
      next.delete(id);
      setSelectedIds(next);
      refetch();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} access code(s)?`)) {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      refetch();
    }
  };

  // KPIs calculation
  const kpiCards = useMemo(() => {
    const total = accessCodes.length;
    const redeemed = accessCodes.filter((c) => c.redeemed_by !== null).length;
    const available = total - redeemed;
    const batchesCount = new Set(accessCodes.map((c) => c.batch_id).filter(Boolean)).size;

    return [
      {
        title: "Total Codes",
        value: total.toLocaleString(),
        icon: <KeyRound className="h-5 w-5 text-primary" />,
      },
      {
        title: "Available Codes",
        value: available.toLocaleString(),
        icon: <Tag className="h-5 w-5 text-blue-500" />,
      },
      {
        title: "Redeemed",
        value: redeemed.toLocaleString(),
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      },
      {
        title: "Active Batches",
        value: batchesCount.toLocaleString(),
        icon: <Clock className="h-5 w-5 text-amber-500" />,
      },
    ];
  }, [accessCodes]);

  const handleCopySingleCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyAllGenerated = () => {
    if (generatedCodes.length === 0) return;
    navigator.clipboard.writeText(generatedCodes.join("\n"));
    toast.success(`Copied ${generatedCodes.length} codes to clipboard!`);
  };

  const handleExportCSV = () => {
    if (generatedCodes.length === 0) return;
    const headers = "Code,Module,GeneratedDate\n";
    const dateStr = new Date().toISOString().split("T")[0];
    const rows = generatedCodes.map((code) => `${code},"${generatedModuleName}",${dateStr}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AccessCodes_${generatedModuleName.replace(/\s+/g, "_")}_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Access codes CSV exported!");
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId) {
      toast.error("Please select a target module");
      return;
    }
    if (codeCount < 1 || codeCount > 500) {
      toast.error("Code quantity must be between 1 and 500");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        moduleId: targetModuleId,
        count: codeCount,
        expiresDays: typeof expiresDays === "number" ? expiresDays : null,
      });

      const codesArray = (result as any[]).map((r) => (typeof r === "string" ? r : r.code));
      const mod = modules.find((m) => m.id === targetModuleId);

      setGeneratedCodes(codesArray);
      setGeneratedModuleName(mod?.name || "Module");
      setIsGenerateModalOpen(false);
      setIsResultModalOpen(true);
      refetch();
    } catch {
      // Error handled by mutation onError
    }
  };

  const columns: ColumnDef<AccessCodeWithDetails>[] = useMemo(
    () => [
      {
        id: "select",
        header: () => {
          const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedIds.has(row.id));
          return (
            <input
              type="checkbox"
              className="rounded border-gray-300 w-4 h-4 cursor-pointer"
              checked={isAllSelected}
              onChange={() => {
                const next = new Set(selectedIds);
                if (isAllSelected) {
                  paginatedData.forEach((row) => next.delete(row.id));
                } else {
                  paginatedData.forEach((row) => next.add(row.id));
                }
                setSelectedIds(next);
              }}
              aria-label="Select all on page"
            />
          );
        },
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300 w-4 h-4 cursor-pointer"
            checked={selectedIds.has(row.original.id)}
            onChange={() => {
              const next = new Set(selectedIds);
              if (next.has(row.original.id)) next.delete(row.original.id);
              else next.add(row.original.id);
              setSelectedIds(next);
            }}
            aria-label={`Select code ${row.original.code}`}
          />
        ),
      },
      {
        accessorKey: "code",
        header: "Access Code",
        cell: ({ row }) => {
          const rawCode = row.original.code;
          const formatted =
            rawCode.length === 16
              ? `${rawCode.slice(0, 4)}-${rawCode.slice(4, 8)}-${rawCode.slice(8, 12)}-${rawCode.slice(12, 16)}`
              : rawCode;
          const isCopied = copiedCodeId === row.original.id;

          return (
            <div className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-foreground">
              <span>{formatted}</span>
              <button
                onClick={() => handleCopySingleCode(formatted, row.original.id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition"
                title="Copy Code"
                aria-label="Copy access code"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        },
      },
      {
        id: "moduleName",
        header: "Target Module",
        cell: ({ row }) => (
          <span className="font-medium text-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            {row.original.modules?.name || "Unknown Module"}
          </span>
        ),
      },
      {
        accessorKey: "batch_id",
        header: "Batch ID",
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
            {row.original.batch_id || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "redeemed_by",
        header: "Redeemed By",
        cell: ({ row }) =>
          row.original.redeemed_by ? (
            <span className="font-medium text-emerald-600 dark:text-emerald-400 select-all">
              {row.original.redeemer_email || "Redeemed"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Available</span>
          ),
      },
      {
        accessorKey: "redeemed_at",
        header: "Redeemed Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.redeemed_at ? formatDate(row.original.redeemed_at) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "expires_at",
        header: "Expires Date",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.expires_at ? formatDate(row.original.expires_at) : "Never"}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isRedeemed = !!row.original.redeemed_by;
          const isExpired = row.original.expires_at && new Date(row.original.expires_at) < new Date();

          if (isRedeemed) {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Redeemed
              </span>
            );
          }
          if (isExpired) {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                Expired
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Active
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
              title="Delete Code"
              aria-label="Delete access code"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [copiedCodeId, deleteMutation.isPending, selectedIds, paginatedData]
  );

  if (error) {
    return (
      <ErrorView
        title="Failed to load Access Codes"
        message={error.message}
        onRetry={() => refetch()}
        className="mt-12"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Access Code Management" />
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground font-bold text-sm hover:bg-destructive/90 transition shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          )}
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Batch Codes</span>
          </button>
        </div>
      </div>

      <KPIGrid cards={kpiCards} compact />

      <FilterBar className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
            Module Filter
          </label>
          <select
            value={selectedModuleFilter}
            onChange={(e) => {
              setSelectedModuleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition"
            aria-label="Module filter"
          >
            <option value="all">All Modules</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
            Redemption Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition"
            aria-label="Redemption status filter"
          >
            <option value="all">All Codes</option>
            <option value="unredeemed">Available (Unredeemed)</option>
            <option value="redeemed">Redeemed</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs uppercase font-bold text-muted-foreground tracking-wide">
            Search Batch ID
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={batchSearch}
              onChange={(e) => {
                setBatchSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2.5 text-sm text-foreground outline-none transition"
              placeholder="e.g. batch_a1b2c3..."
              aria-label="Batch ID search"
            />
          </div>
        </div>
      </FilterBar>

      <DataTable
        columns={columns}
        data={paginatedData}
        pageCount={totalPages}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* MODAL 1: Generate Access Codes Dialog */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <span>Generate Access Codes</span>
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-muted-foreground">
                  Target Module *
                </label>
                <select
                  value={targetModuleId}
                  onChange={(e) => setTargetModuleId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition"
                  required
                >
                  <option value="">Select a Module...</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-muted-foreground">
                  Quantity (Codes Count: 1 - 500) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={codeCount}
                  onChange={(e) => setCodeCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase font-bold text-muted-foreground">
                  Code Expiration (Days)
                </label>
                <select
                  value={expiresDays}
                  onChange={(e) =>
                    setExpiresDays(e.target.value === "" ? "" : parseInt(e.target.value, 10))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition"
                >
                  <option value={365}>1 Year (365 Days)</option>
                  <option value={180}>6 Months (180 Days)</option>
                  <option value={90}>3 Months (90 Days)</option>
                  <option value={30}>30 Days</option>
                  <option value="">Never Expires</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-accent font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition shadow-sm flex items-center gap-2"
                >
                  {generateMutation.isPending ? "Generating..." : "Generate Codes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Generated Codes Output Modal */}
      {isResultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Batch Codes Generated!</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Module: <strong className="text-foreground">{generatedModuleName}</strong> —{" "}
                  {generatedCodes.length} codes created.
                </p>
              </div>
              <button
                onClick={() => setIsResultModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Generated Codes (Formatted for Libraries/Bookshops)
              </label>
              <textarea
                readOnly
                value={generatedCodes.join("\n")}
                rows={10}
                className="w-full font-mono text-sm bg-muted/60 border border-border rounded-lg p-3 outline-none resize-none select-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyAllGenerated}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy All Codes</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-input bg-background font-bold text-sm hover:bg-accent transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <button
                onClick={() => setIsResultModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessCodes;
