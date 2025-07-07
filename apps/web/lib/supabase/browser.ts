// apps/web/lib/supabase/browser.ts
'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { getToken, useAuth } from '@clerk/nextjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client that includes the Clerk user ID as a custom header
 * so Supabase RLS policies using `current_setting('request.headers.clerk-id', true)` work.
 */
export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (input, init = {}) => {
        // Get Clerk session token and user ID
        const token = await getToken({ template: 'supabase' });
        const userId = (await import('@clerk/nextjs')).auth().userId;

        // Inject headers
        const headers = new Headers(init.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        if (userId) headers.set('x-clerk-id', userId);

        return fetch(input, { ...init, headers });
      },
    },
  });
}
