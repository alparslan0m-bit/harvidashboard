import { createClient } from "@supabase/supabase-js";

// NOTE: Service role key (VITE_SUPABASE_ADMIN_KEY) is intentionally used here as this dashboard
// is served only to authenticated admins. For public-facing apps,
// proxy through an Edge Function instead.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAdminKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.VITE_SUPABASE_ADMIN_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "supabase-admin-session",
  },
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
