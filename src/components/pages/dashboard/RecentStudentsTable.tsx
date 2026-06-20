import React, { useMemo } from "react";
import type { RecentStudent } from "../../../hooks/useDashboard";
import { formatDate } from "../../../lib/utils";
import { DataTable } from "../../shared/DataTable";
import { SectionCard } from "../../shared/SectionCard";
import { Link } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";

interface RecentStudentsTableProps {
  students: RecentStudent[];
}

export const RecentStudentsTable: React.FC<RecentStudentsTableProps> = ({
  students,
}) => {
  const columns = useMemo<ColumnDef<RecentStudent>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-semibold text-foreground text-sm truncate">
              {row.original.full_name || "Anonymous User"}
            </span>
            <span className="text-muted-foreground text-xs select-all truncate">
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "total_quizzes",
        header: "Quizzes",
        cell: ({ row }) => (
          <span className="text-foreground font-medium">
            {row.original.total_quizzes}
          </span>
        ),
      },
      {
        accessorKey: "average_score",
        header: "Avg Score",
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.average_score}%
          </span>
        ),
      },
      {
        accessorKey: "joined_date",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.joined_date)}
          </span>
        ),
      },
    ],
    []
  );

  const actions = (
    <Link
      to="/users"
      className="text-sm font-semibold text-foreground hover:underline transition-all"
    >
      View All
    </Link>
  );

  // Take only top 5 rows as per spec
  const visibleStudents = useMemo(() => students.slice(0, 5), [students]);

  return (
    <SectionCard
      title="Recent Students"
      description="Latest registrations and recent performance"
      actions={actions}
      className="p-0 flex flex-col h-auto"
    >
      <div className="px-5 pt-3 pb-3">
        <DataTable
          columns={columns}
          data={visibleStudents}
          pageCount={0}
          currentPage={1}
          onPageChange={() => {}}
          emptyStateTitle="No recent students"
          emptyStateDescription="New student registration records are currently empty."
          emptyStateIcon="Users"
        />
      </div>
    </SectionCard>
  );
};

export default RecentStudentsTable;
