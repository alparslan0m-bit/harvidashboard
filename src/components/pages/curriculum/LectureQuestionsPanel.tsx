import React from "react";
import { useLectureQuestions } from "../../../hooks/useCurriculum";
import { SlideOver } from "../../shared/SlideOver";
import { HelpCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router";

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

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={`Lecture Questions — ${lectureName}`}
      description="List of questions in this topic. To add or edit questions, go to the Question Bank."
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
          <p className="text-xs">No questions found in this lecture topic.</p>
        </div>
      ) : (
        <div className="space-y-4 select-none">
          {questions.map((q, idx) => (
            <div key={q.id} className="border p-4 rounded-lg bg-card space-y-3 shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Question #{idx + 1}
                </span>
                {q.image_url && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200/20">
                    <ImageIcon className="h-3 w-3" />
                    <span>Has Image</span>
                  </span>
                )}
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
                      className={`text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                          : "bg-muted/10 border-border text-muted-foreground"
                      }`}
                    >
                      <span className="mr-1.5 uppercase font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="bg-muted/30 p-2.5 rounded border border-dashed text-[10px] text-muted-foreground mt-2 leading-relaxed">
                  <span className="font-bold text-foreground block mb-0.5 uppercase tracking-wide">Explanation</span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SlideOver>
  );
};
export default LectureQuestionsPanel;
