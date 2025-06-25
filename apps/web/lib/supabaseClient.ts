import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Prefer server-side env vars for server code:
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export { createClient };
