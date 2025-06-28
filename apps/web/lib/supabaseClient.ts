// apps/web/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Named export so existing imports still work
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Optional server helper for future use
export function createServerClient() {
  return supabase;
}
