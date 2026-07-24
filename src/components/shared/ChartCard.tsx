import React from "react";
import { Download } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardActions } from "./Card";
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
      className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-chart-5/10 hover:text-primary transition-all duration-200 focus-ring hover:shadow-sm"
      title="Export Chart Data as CSV"
      aria-label="Export Chart Data"
    >
      <Download className="h-3.5 w-3.5" />
    </button>
  );

  return (
    <Card className={cn(heightClassName, "flex flex-col justify-between overflow-hidden", className)}>
      <CardHeader className="relative">
        <div className="space-y-1 min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions && <CardActions>{actions}</CardActions>}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </CardHeader>
      <CardContent className="flex-1 p-4 w-full relative min-h-0">
        {children}
      </CardContent>
    </Card>
  );
};

export default ChartCard;
