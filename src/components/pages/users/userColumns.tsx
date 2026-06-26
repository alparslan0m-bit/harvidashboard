import { formatDate } from "@/lib/utils";
import type { UserWithDetails } from "@/types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Link } from "react-router";

export function createUserColumns(): ColumnDef<UserWithDetails>[] {
  return [
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
        <Link
          to={`/users/${row.original.id}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition cursor-pointer"
          aria-label="View Student Details"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </Link>
      ),
    },
  ];
}
