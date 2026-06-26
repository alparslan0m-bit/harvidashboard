import React, { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { format, isToday, isYesterday } from "date-fns";
import type { AdminAuditLog } from "@/types/dashboard";
import {
  X,
  Activity,
  BookOpen,
  Layers,
  FolderOpen,
  Calendar,
  HelpCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditActionDetails } from "./AuditActionDetails";
import {
  buildActivitySummary,
  getItemDisplayName,
  getEntityTypeLabel,
} from "@/lib/auditActivityUtils";

interface AdminActivityListProps {
  logs: AdminAuditLog[];
}

interface GroupedAction {
  id: string;
  admin_name: string;
  action_type: string;
  entity_type: string;
  lecture_id?: string;
  lecture_name?: string;
  count: number;
  item_names: string[];
  latest_timestamp: string;
  items: AdminAuditLog[];
}

interface DailyGroup {
  dateStr: string;
  displayDate: string;
  groups: GroupedAction[];
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  years: Calendar,
  modules: Layers,
  subjects: FolderOpen,
  lectures: BookOpen,
  questions: HelpCircle,
};

function getDisplayDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function renderHighlightedSummary(summary: string) {
  const parts = summary.split(/("[^"]+")/g);
  return parts.map((part, index) => {
    if (part.startsWith('"') && part.endsWith('"')) {
      return (
        <span key={index} className="font-semibold text-foreground not-italic">
          {part.slice(1, -1)}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export const AdminActivityList: React.FC<AdminActivityListProps> = ({ logs }) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupedAction | null>(null);

  const dailyGroups = useMemo(() => {
    const byDay: Record<string, AdminAuditLog[]> = {};
    logs.forEach((log) => {
      const dStr = log.created_at.split("T")[0];
      if (!byDay[dStr]) byDay[dStr] = [];
      byDay[dStr].push(log);
    });

    const result: DailyGroup[] = [];

    Object.keys(byDay)
      .sort((a, b) => b.localeCompare(a))
      .forEach((dateStr) => {
        const dayLogs = byDay[dateStr];
        const groupMap: Record<string, GroupedAction> = {};

        dayLogs.forEach((log) => {
          const key = `${log.admin_id}_${log.action_type}_${log.entity_type}_${log.lecture_id || "none"}`;
          if (!groupMap[key]) {
            groupMap[key] = {
              id: key + "_" + dateStr,
              admin_name: log.admin_name,
              action_type: log.action_type,
              entity_type: log.entity_type,
              lecture_id: log.lecture_id,
              lecture_name: log.lecture_name,
              count: 0,
              item_names: [],
              latest_timestamp: log.created_at,
              items: [],
            };
          }

          const group = groupMap[key];
          group.count++;
          group.items.push(log);

          const itemName = getItemDisplayName(log);
          if (itemName && !group.item_names.includes(itemName)) {
            group.item_names.push(itemName);
          }

          if (new Date(log.created_at) > new Date(group.latest_timestamp)) {
            group.latest_timestamp = log.created_at;
          }
        });

        const sortedGroups = Object.values(groupMap).sort(
          (a, b) => new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime(),
        );

        result.push({
          dateStr,
          displayDate: getDisplayDate(dateStr),
          groups: sortedGroups,
        });
      });

    return result;
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-card text-center text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No recent admin activity</p>
      </div>
    );
  }

  const selectedIcon = selectedGroup
    ? ENTITY_ICONS[selectedGroup.entity_type] ?? Activity
    : Activity;

  return (
    <div className="space-y-6">
      {dailyGroups.map((dayGroup) => (
        <div key={dayGroup.dateStr} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            {dayGroup.displayDate}
          </h4>
          <div className="flex flex-col gap-2">
            {dayGroup.groups.map((group) => {
              const Icon = ENTITY_ICONS[group.entity_type] ?? Activity;
              const summary = buildActivitySummary(group);

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className="group relative flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {renderHighlightedSummary(summary)}
                    </p>
                  </div>
                  <div className="shrink-0 pl-3 text-xs text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                    {format(new Date(group.latest_timestamp), "h:mm a")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog.Root open={!!selectedGroup} onOpenChange={(o) => !o && setSelectedGroup(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 max-h-[85vh] overflow-hidden flex flex-col">
            {selectedGroup && (
              <>
                <div className="border-b border-border px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {React.createElement(selectedIcon, { className: "h-5 w-5" })}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <Dialog.Title className="text-lg font-semibold text-foreground">
                          Activity details
                        </Dialog.Title>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {renderHighlightedSummary(buildActivitySummary(selectedGroup))}
                        </p>
                      </div>
                    </div>
                    <Dialog.Close className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition shrink-0">
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(selectedGroup.latest_timestamp), "h:mm a · MMM d, yyyy")}
                    </span>
                    <span className="text-border">|</span>
                    <span>{getEntityTypeLabel(selectedGroup.entity_type)}</span>
                    <span className="text-border">|</span>
                    <span>
                      {selectedGroup.count} {selectedGroup.count === 1 ? "change" : "changes"}
                    </span>
                  </div>
                </div>

                <div className="overflow-y-auto px-6 py-5 space-y-3">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What changed
                  </h5>
                  <div className="space-y-3">
                    {selectedGroup.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className={cn(
                          "rounded-xl border border-border bg-background p-4 shadow-sm",
                          item.action_type === "INSERT" && "border-l-[3px] border-l-emerald-500",
                          item.action_type === "UPDATE" && "border-l-[3px] border-l-amber-500",
                          item.action_type === "DELETE" && "border-l-[3px] border-l-red-500",
                        )}
                      >
                        <p className="mb-3 text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "h:mm:ss a")}
                        </p>
                        <AuditActionDetails
                          entityType={item.entity_type}
                          actionType={item.action_type}
                          details={item.details}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
