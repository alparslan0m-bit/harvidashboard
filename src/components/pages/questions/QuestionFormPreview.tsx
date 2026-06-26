import React from "react";
import { Check, Eye } from "lucide-react";

interface QuestionFormPreviewProps {
  text: string;
  imageUrl?: string | null;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string | null;
  hasContent: boolean;
}

export const QuestionFormPreview: React.FC<QuestionFormPreviewProps> = ({
  text,
  imageUrl,
  options,
  correctAnswerIndex,
  explanation,
  hasContent,
}) => {
  const previewOptions = Array.isArray(options) ? options : [];

  return (
    <div className="hidden lg:flex lg:col-span-2 flex-col bg-muted/20 overflow-y-auto">
      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Live Preview
          </h3>
        </div>

        {hasContent ? (
          <div className="space-y-4">
            {/* Preview: Question card */}
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                {text || (
                  <span className="text-muted-foreground italic">
                    Question text will appear here...
                  </span>
                )}
              </p>

              {imageUrl && imageUrl.startsWith("http") && (
                <div className="mt-2.5 rounded-xl border border-border/40 bg-muted/20 p-2">
                  <img
                    src={imageUrl}
                    alt="Question diagram"
                    className="max-h-32 mx-auto rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Preview: Options */}
            <div className="space-y-1.5">
              {previewOptions.map((opt, idx) => {
                if (!opt && idx >= 2) return null;
                const isCorrect = idx === correctAnswerIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition-all duration-200 ${
                      isCorrect
                        ? "border-emerald-300/60 bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400"
                        : "border-border/50 bg-card text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </span>
                    <span className="truncate">
                      {opt || (
                        <span className="italic text-muted-foreground/50">
                          Option {String.fromCharCode(65 + idx)}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Preview: Explanation */}
            {explanation && (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-3.5 py-2.5">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Explanation
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted mb-3">
              <Eye className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Start typing to see a live preview
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-[200px] mx-auto">
              Your question will appear here as you fill in the form
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
