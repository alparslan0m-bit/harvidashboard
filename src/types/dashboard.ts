import type { PurchaseStatus } from "../lib/constants";

export interface DashboardStats {
  totalUsers: number;
  usersTrend: number;
  quizzesToday: number;
  quizzesTrend: number;
  monthlyRevenueCents: number;
  revenueTrend: number;
  averageQuizScore: number;
}

export interface QuizDayActivity {
  date: string;
  quizzes: number;
}

export interface TopLecture {
  name: string;
  attempts: number;
}

export interface RecentStudent {
  id: string;
  email: string;
  full_name: string;
  total_quizzes: number;
  average_score: number;
  joined_date: string;
}

export interface RecentPurchase {
  id: string;
  email: string;
  itemName: string;
  amountCents: number;
  status: PurchaseStatus;
  date: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  lecture_id?: string;
  lecture_name?: string;
  details: any;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentData: {
    dailyQuizzes: { name: string; quizzes: number }[];
    topLectures: TopLecture[];
    recentStudents: RecentStudent[];
    recentPurchases: RecentPurchase[];
    userGrowth: { month: string; users: number }[];
    revenue: { month: string; revenue: number }[];
    adminAuditLogs: AdminAuditLog[];
  };
}
