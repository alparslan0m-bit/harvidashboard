import { Compass, Play, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Actions" | "Recent";
  shortcut?: string;
  action: () => void;
  icon: LucideIcon;
}

export const PAGE_TITLE_MAP: Record<string, string> = {
  "/": "Dashboard Overview",
  "/analytics": "System Analytics",
  "/curriculum": "Curriculum Management",
  "/questions": "Question Bank",
  "/import": "CSV Question Importer",
  "/purchases": "Transaction Ledger",
  "/users": "User Accounts",
  "/feedback": "Student Feedback Logs",
};

export const TITLE_TO_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TITLE_MAP).map(([path, title]) => [title, path]),
);

export function buildCommands(
  navigate: (path: string) => void,
  onClose: () => void,
): CommandItem[] {
  const go = (path: string) => { navigate(path); onClose(); };
  return [
    { id: "go-dashboard", title: "Go to Dashboard", category: "Navigation", action: () => go("/"), icon: Compass },
    { id: "go-analytics", title: "Go to Analytics", category: "Navigation", action: () => go("/analytics"), icon: Compass },
    { id: "go-curriculum", title: "Go to Curriculum", category: "Navigation", action: () => go("/curriculum"), icon: Compass },
    { id: "go-questions", title: "Go to Questions", category: "Navigation", action: () => go("/questions"), icon: Compass },
    { id: "go-import", title: "Go to CSV Import", category: "Navigation", action: () => go("/import"), icon: Compass },
    { id: "go-purchases", title: "Go to Purchases", category: "Navigation", action: () => go("/purchases"), icon: Compass },
    { id: "go-users", title: "Go to Users", category: "Navigation", action: () => go("/users"), icon: Compass },
    { id: "go-feedback", title: "Go to Feedback", category: "Navigation", action: () => go("/feedback"), icon: Compass },
    { id: "action-add-question", title: "Add Question", category: "Actions", action: () => go("/questions?action=new"), icon: Play },
    { id: "action-upload-csv", title: "Upload CSV", category: "Actions", action: () => go("/import"), icon: Play },
    { id: "action-view-purchases", title: "View Purchases", category: "Actions", action: () => go("/purchases"), icon: Play },
  ];
}

export function buildRecentCommands(
  recents: string[],
  navigate: (path: string) => void,
  onClose: () => void,
): CommandItem[] {
  return recents.map((recentName, index) => ({
    id: `recent-${index}`,
    title: `Recent: ${recentName}`,
    category: "Recent" as const,
    action: () => { navigate(TITLE_TO_PATH[recentName] || "/"); onClose(); },
    icon: RotateCcw,
  }));
}

export const COMMAND_CATEGORIES = ["Navigation", "Actions", "Recent"] as const;
