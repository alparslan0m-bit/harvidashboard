import { supabaseAdmin } from "../lib/supabaseAdmin";
import { LIST_USERS_PAGE_SIZE } from "../lib/constants";
import { throwSupabaseError } from "../lib/errors";
import type { User } from "@supabase/supabase-js";

export async function listAllAuthUsers(context: string): Promise<User[]> {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: LIST_USERS_PAGE_SIZE,
  });

  if (error) {
    throwSupabaseError(`${context}.listUsers`, error.message);
  }

  return data?.users ?? [];
}

export function buildAuthUserEmailMap(users: User[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const user of users) {
    if (user.email) {
      map.set(user.id, user.email);
    }
  }
  return map;
}
