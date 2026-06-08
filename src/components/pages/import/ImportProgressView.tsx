import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import type { ImportErrorLogEntry, ImportSummary } from "@/types/import";

interface ImportProgressViewProps {
  isImporting: boolean;
  importProgress: number;
  importSummary: ImportSummary;
  importErrorLog: ImportErrorLogEntry[];
  onReset: () => void;
}

export function ImportProgressView({
  isImporting,
  importProgress,
  importSummary,
  importErrorLog,
  onReset,
}: ImportProgressViewProps) {
  return (
    <div className="max-w-xl mx-auto border rounded-xl bg-card p-6 shadow-md space-y-6 select-none">
      <div className="text-center space-y-2">
        <h3 className="text-sm font-bold text-foreground">
          {isImporting ? "Processing CSV Database Import..." : "Import completed successfully"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isImporting
            ? "Upserting curriculum structure nodes and questions in batches of 10."
            : "All valid rows processed."}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-foreground">
          <span>Progress</span>
          <span>{importProgress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden border">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${importProgress}%` }}
          ></div>
        </div>
      </div>

      {!isImporting && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>Upsert Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground">
            <div>
              Questions Imported: <span className="font-bold">{importSummary.questionsCount}</span>
            </div>
            <div>
              Lectures Created: <span className="font-bold">{importSummary.lecturesCreated}</span>
            </div>
            <div>
              Subjects Created: <span className="font-bold">{importSummary.subjectsCreated}</span>
            </div>
            <div>
              Modules Created: <span className="font-bold">{importSummary.modulesCreated}</span>
            </div>
            <div>
              Years Created: <span className="font-bold">{importSummary.yearsCreated}</span>
            </div>
          </div>
        </div>
      )}

      {importErrorLog.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-destructive font-bold text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>Import Database Failures: {importErrorLog.length} rows failed</span>
          </div>
          <div className="max-h-32 overflow-y-auto text-[10px] text-destructive space-y-1.5 font-medium">
            {importErrorLog.map((log, idx) => (
              <div key={idx}>
                Row #{log.row}: <span className="font-bold">{log.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isImporting && (
        <button
          onClick={onReset}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-xs font-bold text-white hover:bg-primary/95 transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Import Another File</span>
        </button>
      )}
    </div>
  );
}
