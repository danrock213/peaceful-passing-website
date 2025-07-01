'use client';

import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function VendorAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { user: clerkUser } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      router.push('/sign-in');
      return;
    }

    const ensureVendorSetup = async () => {
      const currentRole = (user.publicMetadata as any)?.role;
      if (currentRole !== 'vendor') {
        try {
          // Update metadata directly
          await clerkUser?.update({
            // @ts-expect-error: not typed correctly but valid at runtime
            publicMetadata: { role: 'vendor' },
          });
          console.log('✅ Clerk metadata updated to vendor');

          // Re-trigger sync after metadata is set
          const res = await fetch('/api/vendor-sync', { method: 'POST' });
          const { hasVendorProfile } = await res.json();

          router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
        } catch (err) {
          console.error('❌ Failed to update metadata or sync profile', err);
        }
      } else {
        // Role is already vendor — continue
        const res = await fetch('/api/vendor-sync', { method: 'POST' });
        const { hasVendorProfile } = await res.json();
        router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
      }
    };

    ensureVendorSetup();
  }, [isLoaded, isSignedIn, user, clerkUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Setting up your vendor account…</p>
    </div>
  );
}
