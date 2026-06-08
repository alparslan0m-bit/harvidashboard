import { useState, useRef } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { downloadTemplate } from "@/utils/import/downloadTemplate";
import { validateImportRows } from "@/utils/import/validateImportRows";
import { importQuestions } from "@/services/importQuestionsService";
import type { CsvRow, ImportErrorLogEntry, ImportSummary, ValidationResult } from "@/types/import";

const INITIAL_SUMMARY: ImportSummary = {
  questionsCount: 0,
  lecturesCreated: 0,
  subjectsCreated: 0,
  modulesCreated: 0,
  yearsCreated: 0,
};

export function useImportWizard() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary>(INITIAL_SUMMARY);
  const [isImporting, setIsImporting] = useState(false);
  const [importErrorLog, setImportErrorLog] = useState<ImportErrorLogEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    downloadTemplate();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (uploadedFile: File) => {
    if (!uploadedFile.name.endsWith(".csv")) {
      toast.error("Invalid file format. Please upload a CSV file.");
      return;
    }

    setFile(uploadedFile);
    Papa.parse<CsvRow>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data);
        const resultsValidated = validateImportRows(results.data);
        setValidationResults(resultsValidated);
        setStep(1);
      },
      error: () => {
        toast.error("Failed to parse CSV file.");
      },
    });
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

  const totalErrors = validationResults.filter((r) => !r.isValid).length;
  const validRows = validationResults.filter((r) => r.isValid);
  const previewRows = validRows.slice(0, 10);

  const handleImport = async () => {
    setIsImporting(true);
    setStep(3);
    setImportProgress(0);
    setImportErrorLog([]);

    const summary = await importQuestions(validRows, {
      onProgress: setImportProgress,
      onError: (entry) => setImportErrorLog((prev) => [...prev, entry]),
    });

    setImportSummary(summary);
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

  return {
    dragActive,
    file,
    parsedRows,
    validationResults,
    step,
    importProgress,
    importSummary,
    isImporting,
    importErrorLog,
    fileInputRef,
    totalErrors,
    validRows,
    previewRows,
    handleDownloadTemplate,
    handleDrag,
    handleDrop,
    handleFileChange,
    triggerFileSelect,
    handleImport,
    handleReset,
  };
}
