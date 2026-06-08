import type { PurchaseWithDetails, Feedback, Profile } from "./database";
import type { FeedbackStatus } from "../lib/constants";

export interface PurchaseListItem extends PurchaseWithDetails {
  userEmail: string;
}

export interface PurchasesPageData {
  purchases: PurchaseListItem[];
  totalCount: number;
  totalPages: number;
}

export interface FeedbackListItem extends Feedback {
  profiles: Pick<Profile, "id" | "full_name"> | null;
  userEmail: string;
  status: FeedbackStatus;
}

export interface FeedbackPageData {
  feedbackList: FeedbackListItem[];
  totalCount: number;
  totalPages: number;
}
