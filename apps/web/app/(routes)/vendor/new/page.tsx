'use client';

import { useRouter } from 'next/navigation';
import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function VendorSignUpPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const hasUpdatedRole = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasUpdatedRole.current) return;

    const updateRole = async () => {
      try {
        await user.update({
          unsafeMetadata: {
            role: 'vendor',
          },
        } as any); // ✅ Type assertion allows metadata typing
        hasUpdatedRole.current = true;
        router.replace('/vendor/dashboard');
      } catch (err) {
        console.error('Failed to update user role:', err);
      }
    };

    updateRole();
  }, [isLoaded, isSignedIn, user, router]);

  return <SignUp path="/vendor/new" routing="path" />;
}
