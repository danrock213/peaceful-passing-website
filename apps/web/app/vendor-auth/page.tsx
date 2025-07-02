'use client';

import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function VendorAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { user: clerkUser } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || !clerkUser) return;

    const ensureVendorRole = async () => {
      const currentRole = (user.unsafeMetadata as any)?.role;

      if (currentRole !== 'vendor') {
        try {
          await clerkUser.update({
            unsafeMetadata: {
              role: 'vendor',
            },
          });
          console.log('✅ Vendor role set via unsafeMetadata');
          window.location.reload(); // Triggers Clerk refetch
          return;
        } catch (err) {
          console.error('❌ Failed to update Clerk unsafeMetadata', err);
          return;
        }
      }

      // 🔁 Sync to Supabase
      try {
        const res = await fetch('/api/vendor-sync', { method: 'POST' });
        const { hasVendorProfile } = await res.json();
        router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
      } catch (err) {
        console.error('❌ Vendor sync failed', err);
      }
    };

    ensureVendorRole();
  }, [isLoaded, isSignedIn, user, clerkUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Setting up your vendor account…</p>
    </div>
  );
}
