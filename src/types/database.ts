export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  raw_app_meta_data: Record<string, unknown>;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

export interface UserStats {
  user_id: string;
  total_quizzes: number;
  total_questions_answered: number;
  correct_answers: number;
  average_score: number;
  best_score: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  updated_at: string | null;
}

export interface Year {
  id: string;
  name: string;
  external_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  year_id: string;
  name: string;
  external_id: string;
  order_index: number;
  is_free: boolean;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  module_id: string;
  name: string;
  external_id: string;
  order_index: number;
  is_free: boolean;
  price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Lecture {
  id: string;
  subject_id: string;
  name: string;
  external_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  lecture_id: string;
  text: string;
  image_url: string | null;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  question_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  lecture_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  module_id: string | null;
  subject_id: string | null;
  status: 'pending' | 'active' | 'failed' | 'refunded' | 'disputed';
  amount_cents: number;
  currency: string;
  payment_id: string | null;
  payment_session_id: string | null;
  provider: string;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  content: string;
  status: 'new' | 'read' | 'resolved' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LectureStatistics {
  id: string;
  lecture_id: string;
  unique_students: number;
  total_attempts: number;
  average_score: number;
  last_updated: string;
}

export interface UserWithDetails {
  id: string;
  email: string;
  created_at: string;
  profile: Profile | null;
  stats: UserStats | null;
  app_metadata?: Record<string, unknown>;
}

export interface PurchaseWithDetails extends Purchase {
  profiles?: Profile | null;
  modules?: Module | null;
  subjects?: Subject | null;
}

export interface QuizResultWithLecture extends QuizResult {
  lectures?: Lecture | null;
}

export interface FeedbackWithUser extends Feedback {
  profiles?: Profile | null;
}
