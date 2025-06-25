// apps/web/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase'; // adjust path if needed

export const createClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
