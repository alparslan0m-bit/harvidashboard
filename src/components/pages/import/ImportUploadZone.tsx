import React from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportUploadZoneProps {
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTriggerFileSelect: () => void;
}

export function ImportUploadZone({
  dragActive,
  fileInputRef,
  onDrag,
  onDrop,
  onFileChange,
  onTriggerFileSelect,
}: ImportUploadZoneProps) {
  return (
    <div className="max-w-xl mx-auto mt-6 select-none">
      <div
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        onClick={onTriggerFileSelect}
        className={cn(
          "flex flex-col items-center justify-center p-12 rounded-xl border border-dashed text-center cursor-pointer transition bg-card hover:bg-muted/10",
          dragActive ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
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
  );
}
