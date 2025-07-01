'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server'; // This import is used server-side only

export default function VendorAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const ensureVendorRole = async () => {
      const currentRole = (user.unsafeMetadata as any)?.role;

      // ✅ If role is not 'vendor', patch it using frontend method
      if (currentRole !== 'vendor') {
        try {
          await user.update({
            unsafeMetadata: {
              role: 'vendor',
            },
          });

          console.log('✅ Vendor role set via unsafeMetadata');

          // Optional: Reload to re-trigger Clerk session update
          window.location.reload();
          return;
        } catch (err) {
          console.error('❌ Failed to update Clerk metadata', err);
        }
      }

      // ✅ Sync with Supabase and redirect
      try {
        const res = await fetch('/api/vendor-sync', { method: 'POST' });
        const { hasVendorProfile } = await res.json();
        router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
      } catch (err) {
        console.error('❌ Vendor sync failed', err);
      }
    };

    ensureVendorRole();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Setting up your vendor account…</p>
    </div>
  );
}
