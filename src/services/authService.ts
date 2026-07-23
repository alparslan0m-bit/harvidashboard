import { supabaseAdmin } from "../lib/supabaseAdmin";
import { LIST_USERS_PAGE_SIZE } from "../lib/constants";
import { throwSupabaseError } from "../lib/errors";
import type { User } from "@supabase/supabase-js";

export async function listAllAuthUsers(context: string): Promise<User[]> {
  const allUsers: User[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: LIST_USERS_PAGE_SIZE,
    });

    if (error) {
      throwSupabaseError(`${context}.listUsers`, error.message);
    }

    const users = data?.users ?? [];
    allUsers.push(...users);
    
    if (users.length < LIST_USERS_PAGE_SIZE) {
      break;
    }
    page++;
  }

  return allUsers;
}

