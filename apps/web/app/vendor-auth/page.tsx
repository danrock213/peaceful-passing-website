'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function VendorAuthClient() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const syncAndRedirect = async () => {
      setRedirecting(true);

      const res = await fetch('/api/vendor-sync', { method: 'POST' });
      const { hasVendorProfile } = await res.json();

      if (hasVendorProfile) {
        router.push('/vendor/bookings');
      } else {
        router.push('/vendors/create');
      }
    };

    syncAndRedirect();
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">
        {redirecting ? 'Redirecting…' : 'Checking your vendor setup…'}
      </p>
    </div>
  );
}
