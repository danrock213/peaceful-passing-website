'use client';

import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function VendorAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const ensureVendor = async () => {
      const role = (user?.publicMetadata as any)?.role;

      if (role !== 'vendor') {
        try {
          await clerk.user?.update({
            // @ts-expect-error: publicMetadata allowed at runtime
            publicMetadata: { role: 'vendor' },
          });
          console.log('✅ Vendor role set in Clerk');
        } catch (err) {
          console.error('❌ Failed to set role:', err);
        }
      }

      try {
        const res = await fetch('/api/vendor-sync', { method: 'POST' });
        const { hasVendorProfile } = await res.json();

        router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
      } catch (err) {
        console.error('❌ Vendor sync failed:', err);
      }
    };

    ensureVendor();
  }, [isLoaded, isSignedIn, user, clerk, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Setting up your vendor account…</p>
    </div>
  );
}
