'use client';

import { useRouter } from 'next/navigation';
import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function VendorSignUpPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const hasInitialized = useRef(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasInitialized.current) return;

    const setupVendor = async () => {
      try {
        hasInitialized.current = true;

        // Step 1: Update role in Clerk
        await user.update({
          unsafeMetadata: {
            role: 'vendor',
          },
        } as any);

        // Step 2: Create placeholder vendor listing if one doesn’t exist
        const { data: existing } = await supabase
          .from('vendors')
          .select('id')
          .eq('created_by', user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from('vendors').insert([
            {
              created_by: user.id,
              name: 'New Vendor',
              category: 'Other',
              location: 'TBD',
              approved: false,
            },
          ]);
        }

        // Step 3: Redirect to dashboard
        router.replace('/vendor/dashboard');
      } catch (err) {
        console.error('Vendor onboarding failed:', err);
      }
    };

    setupVendor();
  }, [isLoaded, isSignedIn, user, router, supabase]);

  return <SignUp path="/vendor/new" routing="path" />;
}
