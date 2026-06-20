import React from "react";
import { Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { SectionCard } from "./SectionCard";
import { toast } from "sonner";

interface ChartCardProps {
  title: string;
  description?: string;
  data?: any[];
  filename?: string;
  children: React.ReactNode;
  className?: string;
  heightClassName?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  data,
  filename = "chart_data",
  children,
  className,
  heightClassName = "h-80",
}) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];

      for (const row of data) {
        const values = headers.map((header) => {
          const val = row[header];
          const strVal = val === null || val === undefined ? "" : String(val);
          return `"${strVal.replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);

      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Chart data exported successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export chart data");
    }
  };

  const actions = data && data.length > 0 && (
    <button
      onClick={handleExport}
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-ring"
      title="Export Chart Data as CSV"
      aria-label="Export Chart Data"
    >
      <Download className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <SectionCard
      title={title}
      description={description}
      actions={actions || undefined}
      className={cn(heightClassName, "flex flex-col justify-between overflow-hidden", className)}
    >
      <div className="flex-1 w-full relative min-h-0">
        {children}
      </div>
    </SectionCard>
  );
};

export default ChartCard;
