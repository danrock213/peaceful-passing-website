'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ClerkSupabaseSync() {
  const { user, isSignedIn } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn || !user) return;

      const { id, emailAddresses, fullName } = user;
      const email = emailAddresses[0]?.emailAddress;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id,
          email,
          full_name: fullName,
        });

      if (error) {
        console.error('❌ Failed to sync Clerk user to Supabase:', error.message);
      } else {
        console.log('✅ Synced Clerk user to Supabase');
      }
    };

    syncUser();
  }, [isSignedIn, user, supabase]);

  return null;
}
