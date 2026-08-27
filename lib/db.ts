import { neon } from '@neondatabase/serverless';

// Server-only Neon (Postgres over HTTP). DATABASE_URL is the pooled connection
// string from the Neon dashboard and must never be exposed to the browser — it
// is not prefixed with NEXT_PUBLIC_, so it stays server-side. All access goes
// through the server actions in lib/trip.ts.
export const sql = neon(process.env.DATABASE_URL!);
