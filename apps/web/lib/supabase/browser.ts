// apps/web/lib/supabase/browser.ts
'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { auth } from '@clerk/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase browser client that attaches Clerk user ID to each request
 * for use in Supabase RLS policies.
 */
export function createBrowserClient() {
  const { userId } = auth(); // ✅ Clerk user ID is available here

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (input, init = {}) => {
        const headers = new Headers(init.headers);
        if (userId) headers.set('x-clerk-id', userId);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
