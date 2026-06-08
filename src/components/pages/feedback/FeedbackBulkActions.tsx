import React from "react";
import { Archive, CheckCheck } from "lucide-react";

interface FeedbackBulkActionsProps {
  selectedCount: number;
  onBulkMarkRead: () => void;
  onBulkArchive: () => void;
}

export const FeedbackBulkActions: React.FC<FeedbackBulkActionsProps> = ({
  selectedCount,
  onBulkMarkRead,
  onBulkArchive,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-sm font-semibold text-muted-foreground">{selectedCount} selected</span>
    <button
      onClick={onBulkMarkRead}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-sm font-semibold text-foreground hover:bg-accent transition"
    >
      <CheckCheck className="h-4 w-4" />
      <span>Mark Read</span>
    </button>
    <button
      onClick={onBulkArchive}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-sm font-semibold text-foreground hover:bg-accent transition"
    >
      <Archive className="h-4 w-4" />
      <span>Archive</span>
    </button>
  </div>
);
