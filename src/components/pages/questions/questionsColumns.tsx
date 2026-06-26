import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Check, List } from "lucide-react";
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
      cell: ({ row }) => (
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {(page - 1) * 25 + row.index + 1}
        </div>
      ),
    },
    {
      accessorKey: "text",
      header: "Question Text",
      cell: ({ row }) => (
        <span className="font-medium text-foreground/90 leading-relaxed line-clamp-2 max-w-sm block cursor-help" title={row.original.text}>
          {row.original.text}
        </span>
      ),
    },
    {
      accessorKey: "lectures.name",
      header: "Lecture Topic",
      cell: ({ row }) => {
        const name = row.original.lectures?.name;
        return name ? (
          <span className="inline-block bg-primary/8 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium truncate max-w-[180px]">
            {name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">N/A</span>
        );
      },
    },
    {
      id: "optionsCount",
      header: "Options",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-foreground font-medium text-sm">
          <List className="h-3.5 w-3.5 text-muted-foreground" />
          {row.original.options?.length || 0} choices
        </span>
      ),
    },
    {
      id: "correctAnswer",
      header: "Correct Answer",
      cell: ({ row }) => {
        const option = row.original.options?.[row.original.correct_answer_index];
        const answerText = option == null ? "N/A" : typeof option === "string" ? option : "N/A";
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[140px]" title={answerText}>
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{answerText}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "image_url",
      header: "Has Image",
      cell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset ${
            row.original.image_url
              ? "bg-primary/10 ring-primary/20 text-primary"
              : "bg-muted ring-border text-muted-foreground"
          }`}
        >
          {row.original.image_url ? "Yes" : "No"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(row.original)}
            className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground hover:scale-105 transition-all duration-150"
            aria-label="Edit question"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(row.original.id)}
            className="p-2 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-150"
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];
}

