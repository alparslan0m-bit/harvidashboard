import React, { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserFilters } from "../components/pages/users/UserFilters";
import { DataTable } from "../components/shared/DataTable";
import { UserDetailPanel } from "../components/pages/users/UserDetailPanel";
import { formatDate } from "../lib/utils";
import type { UserWithDetails } from "../types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { toast } from "sonner";

export const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error, refetch } = useUsers(page, search, filter);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Handle Filter Change
  const handleFilterChange = (val: string) => {
    setFilter(val);
    setPage(1);
  };

  // View Details Trigger
  const handleViewUser = (id: string) => {
    setSelectedUserId(id);
    setIsPanelOpen(true);
  };

  // CSV Export Trigger (downloads all users - no pagination limit)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // 1. Get all profiles & stats
      const { data: profiles, error: pError } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, user_stats(*)");
      if (pError) throw pError;

      // 2. Fetch all auth details via service role client (since we need emails)
      const { data: authData, error: aError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 10000,
      });
      if (aError) throw aError;

      const authMap: Record<string, string> = {};
      authData?.users?.forEach((u: any) => {
        if (u.email) authMap[u.id] = u.email;
      });

      // 3. Formulate CSV rows
      const csvRows = [
        ["email", "full_name", "total_quizzes", "average_score", "joined_date"],
      ];

      profiles.forEach((p: any) => {
        const stats = p.user_stats ? (p.user_stats as any)[0] || null : null;
        const authUser = authData?.users?.find((u: any) => u.id === p.id);
        const email = authMap[p.id] || "N/A";
        const totalQuizzes = stats?.total_quizzes || 0;
        const avgScore = stats?.average_score ? `${stats.average_score}%` : "0%";
        const joinedDate = authUser?.created_at ? formatDate(authUser.created_at) : "N/A";

        csvRows.push([
          email,
          p.full_name || "Anonymous User",
          String(totalQuizzes),
          avgScore,
          joinedDate,
        ]);
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `harvi_users_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file exported successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to export CSV file");
    } finally {
      setExporting(false);
    }
  };

  // Define Columns for the TanStack Table
  const columns: ColumnDef<UserWithDetails>[] = [
    {
      id: "avatar",
      header: "Avatar",
      cell: ({ row }) => {
        const full_name = row.original.profile?.full_name;
        const initials = full_name
          ? full_name
              .split(" ")
              .map((part: string) => part[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : "U";

        return (
          <div className="h-8 w-8 rounded-full bg-zinc-150 border border-border flex items-center justify-center font-bold text-xs text-muted-foreground select-none shrink-0">
            {initials}
          </div>
        );
      },
    },
    {
      accessorKey: "profile.full_name",
      header: "Full Name",
      cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.profile?.full_name || "Anonymous User"}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground select-all">{row.original.email}</span>,
    },
    {
      accessorKey: "stats.total_quizzes",
      header: "Total Quizzes",
      cell: ({ row }) => <span className="text-foreground">{row.original.stats?.total_quizzes ?? 0}</span>,
    },
    {
      accessorKey: "stats.average_score",
      header: "Avg Score",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.stats?.average_score ? `${row.original.stats.average_score}%` : "0%"}
        </span>
      ),
    },
    {
      accessorKey: "stats.current_streak",
      header: "Current Streak",
      cell: ({ row }) => (
        <span className="text-foreground font-medium">
          {row.original.stats?.current_streak ?? 0} {row.original.stats?.current_streak === 1 ? "day" : "days"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          onClick={() => handleViewUser(row.original.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition"
          aria-label="View Student Details"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-md mx-auto mt-12 text-center select-none">
        <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Failed to load User Accounts</h2>
        <p className="mt-1 text-xs text-muted-foreground max-w-xs">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border rounded-md hover:bg-accent hover:text-accent-foreground transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">User Management</h2>
          <p className="text-xs text-muted-foreground">Configure student permissions and details</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting || isLoading || !data?.users?.length}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>{exporting ? "Exporting CSV..." : "Export CSV"}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
      />

      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* User slide-over detail panel */}
      <UserDetailPanel
        userId={selectedUserId}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
export default Users;
