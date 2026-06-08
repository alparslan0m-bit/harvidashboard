import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { STALE_TIMES } from "@/lib/constants";

export function useCurriculumStats() {
  const query = useQuery({
    queryKey: ["curriculum-stats"],
    queryFn: async () => {
      const [yearsRes, modulesRes, subjectsRes, lecturesRes] = await Promise.all([
        supabaseAdmin.from("years").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("modules").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("subjects").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("lectures").select("id", { count: "exact", head: true }),
      ]);

      if (yearsRes.error) throw new Error(yearsRes.error.message);
      if (modulesRes.error) throw new Error(modulesRes.error.message);
      if (subjectsRes.error) throw new Error(subjectsRes.error.message);
      if (lecturesRes.error) throw new Error(lecturesRes.error.message);

      return {
        yearsCount: yearsRes.count || 0,
        modulesCount: modulesRes.count || 0,
        subjectsCount: subjectsRes.count || 0,
        lecturesCount: lecturesRes.count || 0,
      };
    },
    staleTime: STALE_TIMES.curriculum,
  });

  return {
    stats: query.data || { yearsCount: 0, modulesCount: 0, subjectsCount: 0, lecturesCount: 0 },
    isLoadingStats: query.isLoading,
  };
}
