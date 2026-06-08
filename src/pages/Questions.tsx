import React from "react";
import { Link } from "react-router";
import { useQuestionsPage } from "@/hooks/useQuestionsPage";
import { QuestionFilters } from "@/components/pages/questions/QuestionFilters";
import { DataTable, PageHeader, ErrorView, ConfirmDialog } from "@/components/shared";
import { QuestionForm } from "@/components/pages/questions/QuestionForm";
import { Plus, Upload } from "lucide-react";

export const Questions: React.FC = () => {
  const {
    page, setPage, search, filters, setFilters, setSearch,
    selectedQuestion, isFormOpen, deleteQuestionId,
    data, isLoading, error, refetch, columns,
    openCreate, closeForm, confirmDelete, clearDelete,
  } = useQuestionsPage();

  if (error) {
    return (
      <ErrorView title="Failed to load Question Bank" message={error.message} onRetry={() => refetch()} className="mt-12" />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Question Bank"
        description="Manage and filter quiz multiple choice questions"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/import" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-sm font-semibold hover:bg-accent transition">
              <Upload className="h-4 w-4" />
              <span>Bulk Import</span>
            </Link>
            <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-white text-sm font-bold transition">
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>
        }
      />

      <QuestionFilters filters={filters} onFiltersChange={setFilters} search={search} onSearchChange={setSearch} />

      <DataTable
        columns={columns}
        data={data?.questions || []}
        pageCount={data?.totalPages || 0}
        currentPage={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      <QuestionForm question={selectedQuestion} isOpen={isFormOpen} onClose={closeForm} initialLectureId={filters.lectureId} />

      <ConfirmDialog
        isOpen={!!deleteQuestionId}
        onClose={clearDelete}
        onConfirm={confirmDelete}
        title="Delete quiz question?"
        description="This will permanently delete this question from the lecture topic."
        confirmText="Delete Question"
        variant="destructive"
      />
    </div>
  );
};

export default Questions;
