export const PAGE_SIZE = 25;

export const LIST_USERS_PAGE_SIZE = 10000;

export const STALE_TIMES = {
  curriculum: 5 * 60 * 1000,
  dashboard: 30 * 1000,
  purchases: 60 * 1000,
  feedback: 60 * 1000,
  questions: 30 * 1000,
  analytics: 30 * 1000,
  users: 60 * 1000,
  authUsers: 2 * 60 * 1000,
} as const;

export const PURCHASE_STATUSES = [
  "pending",
  "active",
  "failed",
  "refunded",
  "disputed",
] as const;

export type PurchaseStatus = (typeof PURCHASE_STATUSES)[number];

export const FEEDBACK_STATUSES = [
  "new",
  "read",
  "resolved",
  "archived",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const USER_FILTER_OPTIONS = [
  { value: "all", label: "Total Users" },
  { value: "active_streak", label: "Active Streak" },
  { value: "has_purchases", label: "Has Purchases" },
  { value: "inactive_30_days", label: "Inactive 30d" },
] as const;
