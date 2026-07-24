import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STALE_TIMES } from "@/lib/constants";

export function useLectureQuestionCounts(lectureIds: string[]) {
  const serializedKey = lectureIds.slice().sort().join(",");

  const query = useQuery({
    queryKey: ["lecture-question-counts", serializedKey],
    queryFn: async (): Promise<Map<string, number>> => {
      if (!lectureIds.length) return new Map();

      const { data, error } = await supabaseAdmin
        .from("questions")
        .select("lecture_id")
        .in("lecture_id", lectureIds);
      if (error) throw new Error(`[Curriculum.useLectureQuestionCounts] ${error.message}`);

      const countsMap = new Map<string, number>();
      lectureIds.forEach((id) => countsMap.set(id, 0));
      data?.forEach((row) => {
        if (row.lecture_id) {
          countsMap.set(row.lecture_id, (countsMap.get(row.lecture_id) || 0) + 1);
        }
      });
      return countsMap;
    },
    enabled: lectureIds.length > 0,
    staleTime: STALE_TIMES.curriculum,
  });

  return {
    counts: query.data || new Map<string, number>(),
    isLoadingCounts: query.isLoading,
  };
}
