import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Loaded from supabaseClient.ts');
console.log('🟡 NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('🟡 NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey?.slice(0, 8) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
