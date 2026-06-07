import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { Download, UploadCloud, CheckCircle2, AlertTriangle, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";

interface CsvRow {
  year_name: string;
  module_name: string;
  subject_name: string;
  lecture_name: string;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3?: string;
  option_4?: string;
  option_5?: string;
  option_6?: string;
  correct_answer_index: string;
  explanation?: string;
  image_url?: string;
}

interface ValidationResult {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  rowData: CsvRow;
}

export const Import: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  // Parse & Validation States
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload & Validate, 2: Preview, 3: Importing

  // Import Progress States
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState({
    questionsCount: 0,
    lecturesCreated: 0,
    subjectsCreated: 0,
    modulesCreated: 0,
    yearsCreated: 0,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importErrorLog, setImportErrorLog] = useState<{ row: number; error: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 1: Download Template
  const handleDownloadTemplate = () => {
    const headers = [
      "year_name",
      "module_name",
      "subject_name",
      "lecture_name",
      "question_text",
      "option_1",
      "option_2",
      "option_3",
      "option_4",
      "option_5",
      "option_6",
      "correct_answer_index",
      "explanation",
      "image_url",
    ];

    const sampleRow = [
      "Year 1",
      "Cardiovascular System",
      "Cardiology",
      "Heart Murmurs",
      "Which murmur is heard best at the apex in left lateral decubitus position?",
      "Mitral Stenosis",
      "Aortic Regurgitation",
      "Mitral Regurgitation",
      "Aortic Stenosis",
      "",
      "",
      "0",
      "Mitral stenosis is a diastolic murmur heard best at the cardiac apex in left lateral position.",
      "https://example.com/diagram.png",
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers, sampleRow].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "harvi_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // STEP 2: Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Parse CSV & Run Client Validation
  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Invalid file format. Please upload a CSV file.");
      return;
    }

    setFile(file);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data);
        validateRows(results.data);
      },
      error: () => {
        toast.error("Failed to parse CSV file.");
      },
    });
  };

  const validateRows = (rows: CsvRow[]) => {
    const results: ValidationResult[] = rows.map((row, idx) => {
      const rowNumber = idx + 2; // header is row 1
      const errorsList: string[] = [];

      // Required fields
      if (!row.year_name?.trim()) errorsList.push("Missing 'year_name'");
      if (!row.module_name?.trim()) errorsList.push("Missing 'module_name'");
      if (!row.subject_name?.trim()) errorsList.push("Missing 'subject_name'");
      if (!row.lecture_name?.trim()) errorsList.push("Missing 'lecture_name'");
      if (!row.question_text?.trim()) errorsList.push("Missing 'question_text'");
      if (!row.option_1?.trim()) errorsList.push("Missing 'option_1'");
      if (!row.option_2?.trim()) errorsList.push("Missing 'option_2'");
      if (row.correct_answer_index === undefined || row.correct_answer_index === "") {
        errorsList.push("Missing 'correct_answer_index'");
      }

      // Length validations
      if (row.question_text && row.question_text.length > 1000) {
        errorsList.push("question_text exceeds 1000 characters limit");
      }

      // Check correct answer index is numeric 0-5
      const correctIdx = parseInt(row.correct_answer_index, 10);
      if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 5) {
        errorsList.push("correct_answer_index must be a number 0 to 5");
      } else {
        // Must not exceed the number of populated options
        const optionColumns = [
          row.option_1,
          row.option_2,
          row.option_3,
          row.option_4,
          row.option_5,
          row.option_6,
        ];
        const populatedOptionsCount = optionColumns.filter((o) => o && o.trim() !== "").length;
        if (correctIdx >= populatedOptionsCount) {
          errorsList.push(`correct_answer_index (${correctIdx}) exceeds available options count (${populatedOptionsCount})`);
        }
      }

      // Image URL validations
      if (row.image_url && row.image_url.trim() !== "") {
        const urlStr = row.image_url.trim();
        if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
          errorsList.push("image_url must start with http:// or https://");
        }
      }

      return {
        rowNumber,
        isValid: errorsList.length === 0,
        errors: errorsList,
        rowData: row,
      };
    });

    setValidationResults(results);
    setStep(1);
  };

  const totalErrors = validationResults.filter((r) => !r.isValid).length;
  const validRows = validationResults.filter((r) => r.isValid);
  const previewRows = validRows.slice(0, 10);

  // STEP 5: Start DB Import Pipeline (Batch size 10)
  const handleImport = async () => {
    setIsImporting(true);
    setStep(3);
    setImportProgress(0);
    setImportErrorLog([]);

    const batchSize = 10;
    const totalValid = validRows.length;
    let questionsImported = 0;
    let lecturesCreated = 0;
    let subjectsCreated = 0;
    let modulesCreated = 0;
    let yearsCreated = 0;

    // Cache objects to avoid redundant DB reads
    const yearsCache: Record<string, string> = {}; // name -> id
    const modulesCache: Record<string, string> = {}; // yearId:name -> id
    const subjectsCache: Record<string, string> = {}; // moduleId:name -> id
    const lecturesCache: Record<string, string> = {}; // subjectId:name -> id

    // Run import sequentially in batches
    for (let i = 0; i < totalValid; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);

      const promises = batch.map(async ({ rowData, rowNumber }) => {
        try {
          const yName = rowData.year_name.trim();
          const mName = rowData.module_name.trim();
          const sName = rowData.subject_name.trim();
          const lName = rowData.lecture_name.trim();

          // 1. Year Resolution
          let yearId = yearsCache[yName];
          if (!yearId) {
            // Check existence
            const { data: extY } = await supabaseAdmin
              .from("years")
              .select("id")
              .eq("name", yName)
              .maybeSingle();

            if (extY) {
              yearId = extY.id;
            } else {
              const { data: newY, error: yErr } = await supabaseAdmin
                .from("years")
                .insert({ name: yName })
                .select("id")
                .single();
              if (yErr) throw yErr;
              yearId = newY.id;
              yearsCreated++;
            }
            yearsCache[yName] = yearId;
          }

          // 2. Module Resolution
          const modKey = `${yearId}:${mName}`;
          let moduleId = modulesCache[modKey];
          if (!moduleId) {
            const { data: extM } = await supabaseAdmin
              .from("modules")
              .select("id")
              .eq("year_id", yearId)
              .eq("name", mName)
              .maybeSingle();

            if (extM) {
              moduleId = extM.id;
            } else {
              const { data: newM, error: mErr } = await supabaseAdmin
                .from("modules")
                .insert({ year_id: yearId, name: mName, is_free: true }) // Default free
                .select("id")
                .single();
              if (mErr) throw mErr;
              moduleId = newM.id;
              modulesCreated++;
            }
            modulesCache[modKey] = moduleId;
          }

          // 3. Subject Resolution
          const subjKey = `${moduleId}:${sName}`;
          let subjectId = subjectsCache[subjKey];
          if (!subjectId) {
            const { data: extS } = await supabaseAdmin
              .from("subjects")
              .select("id")
              .eq("module_id", moduleId)
              .eq("name", sName)
              .maybeSingle();

            if (extS) {
              subjectId = extS.id;
            } else {
              const { data: newS, error: sErr } = await supabaseAdmin
                .from("subjects")
                .insert({ module_id: moduleId, name: sName, is_free: true }) // Default free
                .select("id")
                .single();
              if (sErr) throw sErr;
              subjectId = newS.id;
              subjectsCreated++;
            }
            subjectsCache[subjKey] = subjectId;
          }

          // 4. Lecture Resolution
          const lectKey = `${subjectId}:${lName}`;
          let lectureId = lecturesCache[lectKey];
          if (!lectureId) {
            const { data: extL } = await supabaseAdmin
              .from("lectures")
              .select("id")
              .eq("subject_id", subjectId)
              .eq("name", lName)
              .maybeSingle();

            if (extL) {
              lectureId = extL.id;
            } else {
              const { data: newL, error: lErr } = await supabaseAdmin
                .from("lectures")
                .insert({ subject_id: subjectId, name: lName })
                .select("id")
                .single();
              if (lErr) throw lErr;
              lectureId = newL.id;
              lecturesCreated++;
            }
            lecturesCache[lectKey] = lectureId;
          }

          // 5. Insert Question
          const optionsArray = [
            rowData.option_1,
            rowData.option_2,
            rowData.option_3,
            rowData.option_4,
            rowData.option_5,
            rowData.option_6,
          ].filter((o) => o && o.trim() !== "");

          const { error: qErr } = await supabaseAdmin.from("questions").insert({
            lecture_id: lectureId,
            text: rowData.question_text.trim(),
            image_url: rowData.image_url?.trim() || null,
            options: optionsArray,
            correct_answer_index: parseInt(rowData.correct_answer_index, 10),
            explanation: rowData.explanation?.trim() || null,
          });

          if (qErr) throw qErr;
          questionsImported++;
        } catch (err: any) {
          setImportErrorLog((prev) => [...prev, { row: rowNumber, error: err.message || "Unknown error" }]);
        }
      });

      await Promise.all(promises);

      // Update progress bar
      const progressPercent = Math.min(Math.round(((i + batch.length) / totalValid) * 100), 100);
      setImportProgress(progressPercent);
    }

    setImportSummary({
      questionsCount: questionsImported,
      lecturesCreated,
      subjectsCreated,
      modulesCreated,
      yearsCreated,
    });
    setIsImporting(false);
    toast.success("Import process completed!");
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setValidationResults([]);
    setStep(1);
    setImportProgress(0);
    setImportErrorLog([]);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">CSV Question Importer</h2>
          <p className="text-xs text-muted-foreground">Bulk upload quiz curriculum and MCQs from spreadsheet</p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Main steps flow */}
      {step === 1 && !file && (
        <div className="max-w-xl mx-auto mt-6 select-none">
          {/* Drag and drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={cn(
              "flex flex-col items-center justify-center p-12 rounded-xl border border-dashed text-center cursor-pointer transition bg-card hover:bg-muted/10",
              dragActive ? "border-primary bg-primary/5" : "border-border"
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
              aria-label="Upload CSV File"
            />
            <UploadCloud className="h-12 w-12 text-muted-foreground mb-4 shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">Click to upload or drag & drop CSV file</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Upload only valid question bank spreadsheets formatted with exact template headers.
            </p>
          </div>
        </div>
      )}

      {/* Validation results table & Previews */}
      {file && step === 1 && (
        <div className="space-y-6">
          {/* Stats recap row */}
          <div className="grid grid-cols-3 gap-6 select-none">
            <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Rows</span>
              <span className="text-xl font-bold text-foreground mt-1 block">{parsedRows.length} rows</span>
            </div>
            <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Valid Rows</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{validRows.length} valid</span>
            </div>
            <div className="border bg-card p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Failed Rows</span>
              <span className="text-xl font-bold text-destructive mt-1 block">{totalErrors} errors</span>
            </div>
          </div>

          {/* Validation errors logger */}
          {totalErrors > 0 && (
            <div className="border border-destructive/20 rounded-xl bg-destructive/5 p-4 space-y-3 select-none">
              <div className="flex items-center gap-2 text-destructive font-bold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Errors found: {totalErrors} row failures will block the import process</span>
              </div>
              <div className="max-h-48 overflow-y-auto border rounded bg-card text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-semibold text-[10px] border-b">
                    <tr>
                      <th scope="col" className="px-4 py-2">Row #</th>
                      <th scope="col" className="px-4 py-2">Validation Failures</th>
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

          {/* Valid row previews */}
          {validRows.length > 0 && (
            <div className="space-y-3 select-none">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previewing Valid Rows (First 10)</h3>
              <div className="border rounded-xl bg-card overflow-x-auto shadow-sm">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-muted/30 border-b uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-2.5">Topic (Year &gt; Lecture)</th>
                      <th scope="col" className="px-4 py-2.5">Question Text</th>
                      <th scope="col" className="px-4 py-2.5">Options Count</th>
                      <th scope="col" className="px-4 py-2.5">Correct Answer</th>
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
                          <td className="px-4 py-2 text-foreground truncate max-w-sm font-semibold">{data.question_text}</td>
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

          {/* Import start trigger controls */}
          <div className="flex gap-4 border-t pt-6 select-none">
            <button
              onClick={handleImport}
              disabled={totalErrors > 0 || validRows.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-xs font-bold text-white hover:bg-primary/95 transition disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              <span>Import {validRows.length} Valid Rows</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset Wizard</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DB Import Progress loader panel */}
      {step === 3 && (
        <div className="max-w-xl mx-auto border rounded-xl bg-card p-6 shadow-md space-y-6 select-none">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold text-foreground">
              {isImporting ? "Processing CSV Database Import..." : "Import completed successfully"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isImporting ? "Upserting curriculum structure nodes and questions in batches of 10." : "All valid rows processed."}
            </p>
          </div>

          {/* Progress Bar */}
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

          {/* Completion Summary */}
          {!isImporting && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Upsert Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground">
                <div>Questions Imported: <span className="font-bold">{importSummary.questionsCount}</span></div>
                <div>Lectures Created: <span className="font-bold">{importSummary.lecturesCreated}</span></div>
                <div>Subjects Created: <span className="font-bold">{importSummary.subjectsCreated}</span></div>
                <div>Modules Created: <span className="font-bold">{importSummary.modulesCreated}</span></div>
                <div>Years Created: <span className="font-bold">{importSummary.yearsCreated}</span></div>
              </div>
            </div>
          )}

          {/* In-flight batch errors list */}
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
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 text-xs font-bold text-white hover:bg-primary/95 transition"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Import Another File</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
export default Import;
