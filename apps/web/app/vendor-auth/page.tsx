'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function VendorAuthPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'checking' | 'redirecting' | 'error'>('idle');

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const syncAndRedirect = async () => {
      setStatus('checking');
      try {
        const res = await fetch('/api/vendor-sync', { method: 'POST' });
        const { hasVendorProfile } = await res.json();
        setStatus('redirecting');
        router.push(hasVendorProfile ? '/vendor/bookings' : '/vendors/create');
      } catch (err) {
        console.error('Vendor sync failed', err);
        setStatus('error');
      }
    };

    syncAndRedirect();
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-600">
        {status === 'idle' && 'Initializing...'}
        {status === 'checking' && 'Checking your vendor status...'}
        {status === 'redirecting' && 'Redirecting you now...'}
        {status === 'error' && 'Something went wrong. Please try again later.'}
      </p>
    </div>
  );
}
