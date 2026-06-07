import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { useQuestions, useQuestionMutations } from "../hooks/useQuestions";
import { QuestionFilters } from "../components/pages/questions/QuestionFilters";
import { DataTable } from "../components/shared/DataTable";
import { QuestionForm } from "../components/pages/questions/QuestionForm";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { formatDate } from "../lib/utils";
import type { Question } from "../types/database";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

export const Questions: React.FC = () => {
  const { search: routerSearch } = useLocation();
  
  // Extract initial lecture filter if navigated from curriculum
  const queryParams = new URLSearchParams(routerSearch);
  const initialLectureId = queryParams.get("lectureId");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    yearId: null as string | null,
    moduleId: null as string | null,
    subjectId: null as string | null,
    lectureId: initialLectureId || null as string | null,
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuestions(filters, page, search);
  const { deleteQuestion } = useQuestionMutations();

  // Reset cascade pages on changes
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // CRUD Forms handlers
  const handleOpenCreate = () => {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setSelectedQuestion(q);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteQuestionId) {
      await deleteQuestion(deleteQuestionId);
      setDeleteQuestionId(null);
    }
  };

  // Reset filter when initialLectureId changes
  useEffect(() => {
    if (initialLectureId) {
      setFilters((prev) => ({ ...prev, lectureId: initialLectureId }));
    }
  }, [initialLectureId]);

  // Define Columns for Question Table
  const columns: ColumnDef<any>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-muted-foreground">{(page - 1) * 25 + row.index + 1}</span>,
    },
    {
      accessorKey: "text",
      header: "Question Text",
      cell: ({ row }) => (
        <span className="font-medium text-foreground line-clamp-2 max-w-sm block">
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
      cell: ({ row }) => <span className="text-foreground font-semibold">{row.original.options?.length || 0} choices</span>,
    },
    {
      id: "correctAnswer",
      header: "Correct Answer",
      cell: ({ row }) => {
        const correctIdx = row.original.correct_answer_index;
        const option = row.original.options?.[correctIdx];
        const answerText = option == null
          ? "N/A"
          : typeof option === "string"
            ? option
            : option.text ?? "N/A";
        return (
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[120px] block">
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
            onClick={() => handleOpenEdit(row.original)}
            className="p-1.5 rounded border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition"
            aria-label="Edit question"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteQuestionId(row.original.id)}
            className="p-1.5 rounded border border-destructive/20 text-destructive hover:bg-destructive/10 transition"
            aria-label="Delete question"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-destructive/20 rounded-xl max-w-md mx-auto mt-12 text-center select-none">
        <div className="h-10 w-10 text-destructive bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Failed to load Question Bank</h2>
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
      {/* Page headers */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Question Bank</h2>
          <p className="text-xs text-muted-foreground">Manage and filter quiz multiple choice questions</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/95 text-xs font-bold transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Cascading selectors and text searches */}
      <QuestionFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* TanStack Table */}
      <DataTable
        columns={columns}
        data={data?.questions || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Question Form Panel */}
      <QuestionForm
        question={selectedQuestion}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedQuestion(null);
        }}
        initialLectureId={filters.lectureId}
      />

      {/* Deletion Dialog */}
      <ConfirmDialog
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleDelete}
        title="Delete quiz question?"
        description="This will permanently delete this question and its options from the lecture topic. This action is fully destructive and cannot be undone."
        confirmText="Delete Question"
        variant="destructive"
      />
    </div>
  );
};
export default Questions;
