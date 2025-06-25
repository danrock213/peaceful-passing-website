import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase'; // Optional if you define DB types

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Optional export for external use
export { createClient };
