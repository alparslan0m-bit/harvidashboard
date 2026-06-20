import { AlertTriangle, Play, RefreshCw } from "lucide-react";
import type { CsvRow, ValidationResult } from "@/types/import";

interface ImportValidationViewProps {
  parsedRows: CsvRow[];
  validationResults: ValidationResult[];
  validRows: ValidationResult[];
  totalErrors: number;
  previewRows: ValidationResult[];
  onImport: () => void;
  onReset: () => void;
}

export function ImportValidationView({
  parsedRows,
  validationResults,
  validRows,
  totalErrors,
  previewRows,
  onImport,
  onReset,
}: ImportValidationViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6 select-none">
        <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Total Rows
          </span>
          <span className="text-xl font-bold text-foreground mt-1 block">{parsedRows.length} rows</span>
        </div>
        <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Valid Rows
          </span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{validRows.length} valid</span>
        </div>
        <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Failed Rows
          </span>
          <span className="text-xl font-bold text-destructive mt-1 block">{totalErrors} errors</span>
        </div>
      </div>

      {totalErrors > 0 && (
        <div className="border border-destructive/20 rounded-xl bg-destructive/5 p-4 space-y-3 select-none">
          <div className="flex items-center gap-2 text-destructive font-bold text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>Errors found: {totalErrors} row failures will block the import process</span>
          </div>
          <div className="max-h-48 overflow-y-auto border rounded bg-card text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/40 text-muted-foreground font-medium text-xs border-b">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    Row #
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Validation Failures
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {validationResults
                  .filter((r) => !r.isValid)
                  .map((res) => (
                    <tr key={res.rowNumber}>
                      <td className="px-4 py-2 text-foreground font-bold">{res.rowNumber}</td>
                      <td className="px-4 py-2 text-destructive font-medium leading-relaxed">
                        {res.errors.join(", ")}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {validRows.length > 0 && (
        <div className="space-y-3 select-none">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Previewing Valid Rows (First 10)
          </h3>
          <div className="border rounded-xl bg-card overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-muted/30 border-b uppercase font-semibold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-2.5">
                    Topic (Year &gt; Lecture)
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Question Text
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Options Count
                  </th>
                  <th scope="col" className="px-4 py-2.5">
                    Correct Answer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewRows.map((r, idx) => {
                  const data = r.rowData;
                  const optArray = [data.option_1, data.option_2, data.option_3, data.option_4].filter(Boolean);
                  const correctIdx = parseInt(data.correct_answer_index, 10);

                  return (
                    <tr key={idx} className="hover:bg-muted/10 transition">
                      <td className="px-4 py-2 text-foreground font-medium truncate max-w-[150px]">
                        {data.year_name} &gt; {data.lecture_name}
                      </td>
                      <td className="px-4 py-2 text-foreground truncate max-w-sm font-semibold">
                        {data.question_text}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{optArray.length} options</td>
                      <td className="px-4 py-2 text-emerald-600 font-bold">{optArray[correctIdx] || "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-4 border-t pt-6 select-none">
        <button
          onClick={onImport}
          disabled={totalErrors > 0 || validRows.length === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          <span>Import {validRows.length} Valid Rows</span>
        </button>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-semibold text-foreground hover:bg-accent transition"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset Wizard</span>
        </button>
      </div>
    </div>
  );
}
