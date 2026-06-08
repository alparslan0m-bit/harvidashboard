import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Question } from "@/types/database";

type QuestionRow = Question & { lectures?: { name?: string } | null };

export function createQuestionColumns(
  page: number,
  onEdit: (q: Question) => void,
  onDelete: (id: string) => void,
): ColumnDef<QuestionRow>[] {
  return [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-muted-foreground">{(page - 1) * 25 + row.index + 1}</span>,
    },
    {
      accessorKey: "text",
      header: "Question Text",
      cell: ({ row }) => (
        <span className="font-medium text-foreground line-clamp-2 max-w-sm block cursor-help" title={row.original.text}>
          {row.original.text}
        </span>
      ),
    },
    {
      accessorKey: "lectures.name",
      header: "Lecture Topic",
      cell: ({ row }) => <span className="text-foreground">{row.original.lectures?.name || "N/A"}</span>,
    },
    {
      id: "optionsCount",
      header: "Options",
      cell: ({ row }) => (
        <span className="text-foreground font-semibold">{row.original.options?.length || 0} choices</span>
      ),
    },
    {
      id: "correctAnswer",
      header: "Correct Answer",
      cell: ({ row }) => {
        const option = row.original.options?.[row.original.correct_answer_index];
        const answerText = option == null ? "N/A" : typeof option === "string" ? option : "N/A";
        return (
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[120px] block" title={answerText}>
            {answerText}
          </span>
        );
      },
    },
    {
      accessorKey: "image_url",
      header: "Has Image",
      cell: ({ row }) => (
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
            row.original.image_url
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
              : "bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-800/10 dark:text-zinc-500"
          }`}
        >
          {row.original.image_url ? "Yes" : "No"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row.original)}
            className="p-1.5 rounded border text-muted-foreground hover:bg-accent transition"
            aria-label="Edit question"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(row.original.id)}
            className="p-1.5 rounded border border-destructive/20 text-destructive hover:bg-destructive/10 transition"
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];
}
