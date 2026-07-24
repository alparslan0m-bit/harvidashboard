import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/queryKeys";
import { STALE_TIMES } from "@/lib/constants";
import { listAllAuthUsers } from "@/services/authService";
import type { User } from "@supabase/supabase-js";

/**
 * Returns a helper that fetches (or reads from cache) all auth users.
 * Call `fetchAuthUsers()` inside any queryFn to share the cached result
 * across every page — avoiding redundant listAllAuthUsers round-trips.
 */
export function useAuthUsersFetcher() {
  const queryClient = useQueryClient();

  return function fetchAuthUsers(context: string): Promise<User[]> {
    return queryClient.fetchQuery({
      queryKey: QUERY_KEYS.authUsers,
      queryFn: () => listAllAuthUsers(context),
      staleTime: STALE_TIMES.authUsers,
    });
  };
}
