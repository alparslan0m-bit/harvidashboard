CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_start timestamptz := date_trunc('day', now());
  yesterday_start timestamptz := date_trunc('day', now() - interval '1 day');
  this_month_start timestamptz := date_trunc('month', now());
  last_month_start timestamptz := date_trunc('month', now() - interval '1 month');
  ninety_days_ago timestamptz := now() - interval '90 days';

  v_total_users bigint;
  v_this_month_users bigint;
  v_last_month_users bigint;
  v_users_trend numeric := 0;

  v_quizzes_today bigint;
  v_quizzes_yesterday bigint;
  v_quizzes_trend numeric := 0;

  v_this_month_revenue bigint;
  v_last_month_revenue bigint;
  v_revenue_trend numeric := 0;

  v_avg_score numeric := 0;
BEGIN
  -- 1. Users
  SELECT count(*) INTO v_total_users FROM profiles;
  SELECT count(*) INTO v_this_month_users FROM profiles WHERE created_at >= this_month_start;
  SELECT count(*) INTO v_last_month_users FROM profiles WHERE created_at >= last_month_start AND created_at < this_month_start;
  IF v_last_month_users > 0 THEN
    v_users_trend := round(((v_this_month_users - v_last_month_users)::numeric / v_last_month_users) * 100, 2);
  END IF;

  -- 2. Quizzes
  SELECT count(*) INTO v_quizzes_today FROM quiz_results WHERE created_at >= today_start;
  SELECT count(*) INTO v_quizzes_yesterday FROM quiz_results WHERE created_at >= yesterday_start AND created_at < today_start;
  IF v_quizzes_yesterday > 0 THEN
    v_quizzes_trend := round(((v_quizzes_today - v_quizzes_yesterday)::numeric / v_quizzes_yesterday) * 100, 2);
  END IF;

  -- 3. Revenue
  SELECT coalesce(sum(amount_cents), 0) INTO v_this_month_revenue FROM purchases WHERE status = 'active' AND created_at >= this_month_start;
  SELECT coalesce(sum(amount_cents), 0) INTO v_last_month_revenue FROM purchases WHERE status = 'active' AND created_at >= last_month_start AND created_at < this_month_start;
  IF v_last_month_revenue > 0 THEN
    v_revenue_trend := round(((v_this_month_revenue - v_last_month_revenue)::numeric / v_last_month_revenue) * 100, 2);
  END IF;

  -- 4. Average Quiz Score
  SELECT coalesce(round(avg(score)::numeric, 2), 0) INTO v_avg_score FROM quiz_results WHERE created_at >= ninety_days_ago;

  RETURN json_build_object(
    'totalUsers', v_total_users,
    'usersTrend', v_users_trend,
    'quizzesToday', v_quizzes_today,
    'quizzesTrend', v_quizzes_trend,
    'monthlyRevenueCents', v_this_month_revenue,
    'revenueTrend', v_revenue_trend,
    'averageQuizScore', v_avg_score
  );
END;
$$;
