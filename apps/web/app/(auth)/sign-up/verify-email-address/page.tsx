'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailRedirect() {
  const router = useRouter();

  useEffect(() => {
    // You can delay this if you want to show a "Thanks for signing up!" screen
    router.push('/vendor-auth');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700 text-sm">Verifying your email…</p>
    </div>
  );
}
