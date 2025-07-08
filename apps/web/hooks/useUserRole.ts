'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function useUserRole() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) {
      setRole(null);
      setLoading(false);
      return;
    }

    const supabase = createBrowserClient();

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('clerk_id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching user role:', error.message);
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
      } catch (err) {
        console.error('❌ Unexpected error fetching role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [isLoaded, isSignedIn, user?.id]);

  return { role, loading };
}
