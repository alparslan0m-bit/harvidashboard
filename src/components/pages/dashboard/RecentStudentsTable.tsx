import React from "react";
import type { RecentStudent } from "../../../hooks/useDashboard";
import { formatDate } from "../../../lib/utils";
import { EmptyState } from "../../shared/EmptyState";

interface RecentStudentsTableProps {
  students: RecentStudent[];
}

export const RecentStudentsTable: React.FC<RecentStudentsTableProps> = ({
  students,
}) => {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm flex flex-col h-[400px]">
      <div className="p-6 border-b border-border/50">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Recent Students
        </h2>
        <p className="text-xs text-muted-foreground">
          Latest registrations and recent performance
        </p>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {students.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <EmptyState
              icon="Users"
              title="No students yet"
              description="New student registration logs are empty."
            />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-border/50 text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase tracking-[0.18em] text-[11px] font-semibold sticky top-0 border-b border-border/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Quizzes
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Avg Score
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-foreground text-sm">
                        {student.full_name}
                      </span>
                      <span className="text-muted-foreground text-[11px] select-all">
                        {student.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-foreground">
                    {student.total_quizzes}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium text-foreground">
                      {student.average_score}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {formatDate(student.joined_date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
export default RecentStudentsTable;
