import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createBrowserClient } from '@/lib/supabase/browser'; // renamed import

export default function useUserRole() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setRole(null);
      setLoading(false);
      return;
    }

    async function fetchRole() {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('clerk_id', user!.id)  // <-- non-null assertion here
          .single();

        if (error) {
          console.error('Error fetching user role:', error.message);
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
      } catch (err) {
        console.error('Unexpected error fetching role:', err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [isLoaded, isSignedIn, user]);

  return { role, loading };
}
