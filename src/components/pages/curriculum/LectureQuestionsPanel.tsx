import React, { useMemo } from "react";
import { useLectureQuestions } from "../../../hooks/useCurriculum";
import { SlideOver } from "../../shared/SlideOver";
import { HelpCircle, ExternalLink, Image as ImageIcon, Check } from "lucide-react";
import { Link } from "react-router";
import CopyButton from "../../shared/CopyButton";

interface LectureQuestionsPanelProps {
  lectureId: string | null;
  lectureName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LectureQuestionsPanel: React.FC<LectureQuestionsPanelProps> = ({
  lectureId,
  lectureName,
  isOpen,
  onClose,
}) => {
  const { questions, isLoadingQuestions } = useLectureQuestions(lectureId);

  // Compute metrics for the summary bar
  const summary = useMemo(() => {
    if (!questions) return { hasImages: 0, hasExplanations: 0 };
    const hasImages = questions.filter((q) => q.image_url).length;
    const hasExplanations = questions.filter((q) => q.explanation).length;
    return { hasImages, hasExplanations };
  }, [questions]);

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Lecture Questions — ${lectureName} ${questions.length > 0 ? `(${questions.length})` : ""}`}
      description="List of questions in this topic. To add, edit, or delete questions, visit the Question Bank."
      footer={
        <Link
          to={`/questions?lectureId=${lectureId}`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-semibold select-none transition"
        >
          <span>Open in Question Bank</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {isLoadingQuestions ? (
        <div className="space-y-4 animate-pulse select-none">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted border rounded-lg"></div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground select-none">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-xs font-medium">No questions found in this lecture topic.</p>
        </div>
      ) : (
        <div className="space-y-4 select-none">
          {/* Summary Bar */}
          <div className="flex gap-2 items-center justify-between text-[11px] font-semibold text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/60">
            <span>Total: {questions.length} questions</span>
            <span className="flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5 text-indigo-500" />
              {summary.hasImages} with image{summary.hasImages === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
              {summary.hasExplanations} with explanation{summary.hasExplanations === 1 ? "" : "s"}
            </span>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="border border-border/60 p-4 rounded-lg bg-card space-y-3 shadow-sm hover:shadow transition duration-200">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                      Q{idx + 1}
                    </div>
                    {q.image_url && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200/20">
                        <ImageIcon className="h-3 w-3" />
                        <span>Has Image</span>
                      </span>
                    )}
                  </div>
                  <CopyButton text={q.text} className="h-7 w-7 text-muted-foreground hover:text-foreground" />
                </div>

                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  {q.text}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correct_answer_index;
                    return (
                      <div
                        key={oIdx}
                        className={`text-[11px] px-2.5 py-2 rounded border transition-colors flex items-center gap-1.5 ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                            : "bg-muted/10 border-border/60 text-muted-foreground"
                        }`}
                      >
                        <span className="uppercase font-bold shrink-0">{String.fromCharCode(65 + oIdx)}.</span>
                        {isCorrect && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        <span className="truncate">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="bg-muted/30 p-2.5 rounded border border-dashed border-border text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    <span className="font-bold text-foreground block mb-0.5 uppercase tracking-wide">Explanation</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SlideOver>
  );
};

export default LectureQuestionsPanel;
