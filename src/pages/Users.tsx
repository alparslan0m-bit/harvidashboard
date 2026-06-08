import React, { useState, useMemo, useCallback } from "react";
import { useUsers } from "../hooks/useUsers";
import { UserFilters } from "../components/pages/users/UserFilters";
import { DataTable } from "../components/shared/DataTable";
import { UserDetailPanel } from "../components/pages/users/UserDetailPanel";
import { PageHeader } from "../components/shared/PageHeader";
import { ErrorView } from "../components/shared/ErrorView";
import { formatDate } from "../lib/utils";
import type { UserWithDetails } from "../types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Eye } from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error, refetch } = useUsers(page, search, filter);

  // Handle Search Input Change
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  // Handle Filter Change
  const handleFilterChange = useCallback((val: string) => {
    setFilter(val);
    setPage(1);
  }, []);

  // View Details Trigger
  const handleViewUser = useCallback((id: string) => {
    setSelectedUserId(id);
    setIsPanelOpen(true);
  }, []);

  // CSV Export Trigger (downloads page only OR all records)
  const handleExportCSV = async (currentPageOnly: boolean) => {
    setExporting(true);
    try {
      let exportProfiles: any[] = [];
      let exportAuthUsers: any[] = [];

      if (currentPageOnly) {
        if (!data?.users?.length) {
          toast.error("No users on current page to export");
          return;
        }
        exportProfiles = data.users.map((u) => ({
          id: u.id,
          full_name: u.profile?.full_name,
          user_stats: u.stats ? [u.stats] : [],
        }));
        exportAuthUsers = data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
        }));
      } else {
        // Fetch all profiles from public schema
        const { data: allProfiles, error: pError } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name, user_stats(*)");
        if (pError) throw pError;
        exportProfiles = allProfiles || [];

        // Fetch all auth details via service role client (limit 10000)
        const { data: authData, error: aError } = await supabaseAdmin.auth.admin.listUsers({
          perPage: 10000,
        });
        if (aError) throw aError;
        exportAuthUsers = authData?.users || [];
      }

      const authMap: Record<string, string> = {};
      const authCreatedMap: Record<string, string> = {};
      exportAuthUsers.forEach((u: any) => {
        if (u.email) authMap[u.id] = u.email;
        if (u.created_at) authCreatedMap[u.id] = u.created_at;
      });

      const csvRows = [
        ["email", "full_name", "total_quizzes", "average_score", "joined_date"],
      ];

      exportProfiles.forEach((p: any) => {
        const stats = p.user_stats
          ? (Array.isArray(p.user_stats) ? p.user_stats[0] : p.user_stats) || null
          : null;
        const email = authMap[p.id] || "N/A";
        const totalQuizzes = stats?.total_quizzes || 0;
        const avgScore = stats?.average_score ? `${stats.average_score}%` : "0%";
        const joinedDate = authCreatedMap[p.id] ? formatDate(authCreatedMap[p.id]) : "N/A";

        csvRows.push([
          email,
          p.full_name || "Anonymous User",
          String(totalQuizzes),
          avgScore,
          joinedDate,
        ]);
      });

      const csvContent =
        "data:text/csv;charset=utf-8," +
        csvRows
          .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
          .join("\n");
      const encodedUri = encodeURI(csvContent);

      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `harvi_users_${currentPageOnly ? "page" : "all"}_export_${Date.now()}.csv`
      );
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

  // Define Columns for the TanStack Table (useMemo optimized)
  const columns = useMemo<ColumnDef<UserWithDetails>[]>(
    () => [
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
            <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-muted-foreground select-none shrink-0">
              {initials}
            </div>
          );
        },
      },
      {
        accessorKey: "profile.full_name",
        header: "Full Name",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.profile?.full_name || "Anonymous User"}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground select-all">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "stats.total_quizzes",
        header: "Total Quizzes",
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.stats?.total_quizzes ?? 0}</span>
        ),
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
            {row.original.stats?.current_streak ?? 0}{" "}
            {row.original.stats?.current_streak === 1 ? "day" : "days"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.created_at)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleViewUser(row.original.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition cursor-pointer"
            aria-label="View Student Details"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View</span>
          </button>
        ),
      },
    ],
    [handleViewUser]
  );

  if (error) {
    return (
      <ErrorView
        title="Failed to load User Accounts"
        message={error.message}
        onRetry={refetch}
        className="mt-12"
      />
    );
  }

  const exportActions = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          disabled={exporting || isLoading || !data?.users?.length}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50 cursor-pointer"
          aria-label="Export Actions"
        >
          <Download className="h-4 w-4" />
          <span>{exporting ? "Exporting CSV..." : "Export CSV"}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[150px] rounded-lg border border-border bg-card p-1 shadow-lg focus:outline-none select-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Item
            onClick={() => handleExportCSV(true)}
            className="relative flex items-center rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
          >
            Export current page
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onClick={() => handleExportCSV(false)}
            className="relative flex items-center rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent hover:text-accent-foreground outline-none cursor-pointer"
          >
            Export all users
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  return (
    <div className="space-y-5">
      {/* Top action header */}
      <PageHeader
        title="User Accounts"
        description="Configure student permissions, details, and access control."
        actions={exportActions}
      />

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
        totalCount={data?.totalCount || 0}
        pageSize={25}
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
