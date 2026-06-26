import type { AdminAuditLog } from "@/types/dashboard";

export function getItemDisplayName(log: AdminAuditLog): string | null {
  if (log.entity_type === "lectures" && log.lecture_name) {
    return log.lecture_name;
  }

  const details = log.details;
  if (details && typeof details === "object") {
    if (typeof details.name === "string" && details.name.trim()) {
      return details.name.trim();
    }
    if (typeof details.text === "string" && details.text.trim()) {
      const text = details.text.trim();
      return text.length > 72 ? `${text.slice(0, 72)}…` : text;
    }
  }

  return log.lecture_name ?? null;
}

export function getEntityLabel(entityType: string, count = 1): string {
  const labels: Record<string, [string, string]> = {
    years: ["year", "years"],
    modules: ["module", "modules"],
    subjects: ["subject", "subjects"],
    lectures: ["lecture", "lectures"],
    questions: ["question", "questions"],
  };

  const pair = labels[entityType];
  if (!pair) return entityType;
  return count === 1 ? pair[0] : pair[1];
}

export function getActionVerb(actionType: string): string {
  switch (actionType) {
    case "INSERT":
      return "added";
    case "UPDATE":
      return "updated";
    case "DELETE":
      return "removed";
    default:
      return "changed";
  }
}

export function getActionLabel(actionType: string): string {
  switch (actionType) {
    case "INSERT":
      return "Added";
    case "UPDATE":
      return "Updated";
    case "DELETE":
      return "Removed";
    default:
      return "Changed";
  }
}

export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    years: "Year",
    modules: "Module",
    subjects: "Subject",
    lectures: "Lecture",
    questions: "Question",
  };
  return labels[entityType] ?? entityType;
}

export function formatNameList(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return `"${names[0]}"`;
  if (names.length === 2) return `"${names[0]}" and "${names[1]}"`;
  return `"${names[0]}", "${names[1]}", and ${names.length - 2} more`;
}

export interface ActivityGroupLike {
  admin_name: string;
  action_type: string;
  entity_type: string;
  lecture_name?: string;
  count: number;
  item_names: string[];
}

export function buildActivitySummary(group: ActivityGroupLike): string {
  const verb = getActionVerb(group.action_type);
  const entity = getEntityLabel(group.entity_type, group.count);
  const names = group.item_names;

  if (group.entity_type === "questions" && group.lecture_name) {
    if (group.count === 1 && names.length === 1) {
      return `${group.admin_name} ${verb} a question to "${group.lecture_name}"`;
    }
    return `${group.admin_name} ${verb} ${group.count} ${entity} in "${group.lecture_name}"`;
  }

  if (group.count === 1 && names.length === 1) {
    return `${group.admin_name} ${verb} the ${entity} ${formatNameList(names)}`;
  }

  if (names.length > 0) {
    return `${group.admin_name} ${verb} ${group.count} ${entity}: ${formatNameList(names)}`;
  }

  return `${group.admin_name} ${verb} ${group.count} ${entity}`;
}
