import React from "react";
import { Check, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getActionLabel, getEntityTypeLabel } from "@/lib/auditActivityUtils";

const PRIMARY_FIELD: Record<string, string> = {
  lectures: "name",
  modules: "name",
  subjects: "name",
  years: "name",
  questions: "text",
};

function QuestionOptions({
  options,
  correctIndex,
}: {
  options: string[];
  correctIndex: number;
}) {
  return (
    <ul className="space-y-2">
      {options.map((option, index) => (
        <li
          key={index}
          className={cn(
            "flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm",
            index === correctIndex
              ? "bg-emerald-500/8 text-foreground ring-1 ring-emerald-500/20"
              : "bg-muted/50 text-muted-foreground",
          )}
        >
          <span className="font-medium tabular-nums shrink-0 text-xs mt-0.5">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="flex-1 break-words leading-relaxed">{option}</span>
          {index === correctIndex && (
            <span className="inline-flex items-center gap-1 shrink-0 text-[11px] font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Correct
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function buildMetaChips(details: Record<string, unknown>, entityType: string): string[] {
  const chips: string[] = [];

  if (entityType === "modules" || entityType === "subjects") {
    if (details.is_free === true) {
      chips.push("Free for everyone");
    } else if (typeof details.price_cents === "number" && details.price_cents > 0) {
      chips.push(formatCurrency(details.price_cents));
    } else {
      chips.push("Paid content");
    }
  }

  const order =
    typeof details.order_index === "number"
      ? details.order_index
      : typeof details.question_order === "number"
        ? details.question_order
        : null;

  if (order !== null) {
    chips.push(`Position ${order + 1}`);
  }

  return chips;
}

interface AuditActionDetailsProps {
  entityType: string;
  actionType: string;
  details: Record<string, unknown> | null | undefined;
}

export const AuditActionDetails: React.FC<AuditActionDetailsProps> = ({
  entityType,
  actionType,
  details,
}) => {
  if (!details || typeof details !== "object") {
    return <p className="text-sm text-muted-foreground">No additional information was saved.</p>;
  }

  const primaryKey = PRIMARY_FIELD[entityType];
  const primaryValue = primaryKey ? details[primaryKey] : undefined;
  const metaChips = buildMetaChips(details, entityType);
  const explanation =
    typeof details.explanation === "string" && details.explanation.trim()
      ? details.explanation.trim()
      : null;
  const imageUrl = typeof details.image_url === "string" ? details.image_url : null;

  const options = Array.isArray(details.options) ? (details.options as string[]) : null;
  const correctIndex =
    typeof details.correct_answer_index === "number" ? details.correct_answer_index : -1;

  const actionLabel = getActionLabel(actionType);
  const entityLabel = getEntityTypeLabel(entityType);
  const isRemoved = actionType === "DELETE";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            actionType === "INSERT" && "bg-emerald-500/10 text-emerald-700",
            actionType === "UPDATE" && "bg-amber-500/10 text-amber-700",
            actionType === "DELETE" && "bg-red-500/10 text-red-700",
          )}
        >
          {actionLabel}
        </span>
        <span className="text-xs text-muted-foreground">{entityLabel}</span>
      </div>

      {primaryValue != null && primaryValue !== "" && entityType !== "questions" && (
        <p
          className={cn(
            "text-base font-semibold text-foreground leading-snug break-words",
            isRemoved && "line-through decoration-muted-foreground/50 text-muted-foreground",
          )}
        >
          {String(primaryValue)}
        </p>
      )}

      {entityType === "questions" && primaryValue != null && primaryValue !== "" && (
        <blockquote
          className={cn(
            "border-l-2 border-primary/30 pl-3 text-sm leading-relaxed text-foreground italic",
            isRemoved && "line-through text-muted-foreground",
          )}
        >
          {String(primaryValue)}
        </blockquote>
      )}

      {metaChips.length > 0 && (
        <p className="text-sm text-muted-foreground">{metaChips.join(" · ")}</p>
      )}

      {options && options.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Answer choices</p>
          <QuestionOptions options={options} correctIndex={correctIndex} />
        </div>
      )}

      {explanation && (
        <div className="rounded-lg bg-muted/40 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Explanation
          </p>
          <p className="text-sm leading-relaxed text-foreground">{explanation}</p>
        </div>
      )}

      {imageUrl && (
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          View attached image
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      {!primaryValue && !options?.length && !explanation && metaChips.length === 0 && (
        <p className="text-sm text-muted-foreground">No additional information was saved.</p>
      )}
    </div>
  );
};
