import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

export const createClient = () =>
  createPagesServerClient<Database>({ cookies });
