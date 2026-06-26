export interface DashboardStats {
  totalUsers: number;
  usersTrend: number;
  quizzesToday: number;
  quizzesTrend: number;
  monthlyRevenueCents: number;
  revenueTrend: number;
  averageQuizScore: number;
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
    adminAuditLogs: AdminAuditLog[];
  };
}
