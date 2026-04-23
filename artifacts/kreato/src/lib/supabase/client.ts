import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let _client: ReturnType<typeof createSupabaseClient<Database>> | undefined;

export function createClient() {
  if (!_client) {
    _client = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storageKey: "kreato-auth",
          storage:
            typeof window !== "undefined" ? window.localStorage : undefined,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      }
    );
  }
  return _client;
}
