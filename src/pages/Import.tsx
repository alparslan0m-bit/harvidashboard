import React from "react";
import { Download } from "lucide-react";
import { useImportWizard } from "@/hooks/useImportWizard";
import { ImportUploadZone } from "@/components/pages/import/ImportUploadZone";
import { ImportValidationView } from "@/components/pages/import/ImportValidationView";
import { ImportProgressView } from "@/components/pages/import/ImportProgressView";

export const Import: React.FC = () => {
  const wizard = useImportWizard();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">CSV Question Importer</h2>
          <p className="text-xs text-muted-foreground">Bulk upload quiz curriculum and MCQs from spreadsheet</p>
        </div>
        <button
          onClick={wizard.handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition"
        >
          <Download className="h-4 w-4" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {wizard.step === 1 && !wizard.file && (
        <ImportUploadZone
          dragActive={wizard.dragActive}
          fileInputRef={wizard.fileInputRef}
          onDrag={wizard.handleDrag}
          onDrop={wizard.handleDrop}
          onFileChange={wizard.handleFileChange}
          onTriggerFileSelect={wizard.triggerFileSelect}
        />
      )}

      {wizard.file && wizard.step === 1 && (
        <ImportValidationView
          parsedRows={wizard.parsedRows}
          validationResults={wizard.validationResults}
          validRows={wizard.validRows}
          totalErrors={wizard.totalErrors}
          previewRows={wizard.previewRows}
          onImport={wizard.handleImport}
          onReset={wizard.handleReset}
        />
      )}

      {wizard.step === 3 && (
        <ImportProgressView
          isImporting={wizard.isImporting}
          importProgress={wizard.importProgress}
          importSummary={wizard.importSummary}
          importErrorLog={wizard.importErrorLog}
          onReset={wizard.handleReset}
        />
      )}
    </div>
  );
};

export default Import;
