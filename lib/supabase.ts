import { createClient } from '@supabase/supabase-js';

// The publishable key (sb_publishable_...) is safe to ship to the browser: it
// carries the same low privileges as the legacy anon key and resolves to the
// `anon` Postgres role, so the RLS policies in supabase/migrations govern
// everything it can do.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
