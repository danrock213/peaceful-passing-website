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

    const syncVendorRole = async () => {
      const role = (user?.publicMetadata as any)?.role;

      if (role !== 'vendor') {
        await clerk.user?.update({
          public_metadata: {
            role: 'vendor',
          }
        });
      }

      const res = await fetch('/api/vendor-sync', { method: 'POST' });
      const { hasVendorProfile } = await res.json();

      router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
    };

    syncVendorRole();
  }, [isLoaded, isSignedIn, user, clerk, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">Setting up your vendor account…</p>
    </div>
  );
}
