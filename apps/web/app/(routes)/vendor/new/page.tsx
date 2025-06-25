'use client';

import { useRouter } from 'next/navigation';
import { SignUp, useUser, useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function VendorSignUpPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { clerk } = useClerk();

  // After user signs up and is signed in, update role metadata once
  useEffect(() => {
    async function updateRole() {
      if (isSignedIn && user) {
        try {
          await clerk.client.users.updateUserMetadata(user.id, {
            publicMetadata: { role: 'vendor' },
          });
          // Redirect to vendor dashboard after role update
          router.replace('/vendor/dashboard');
        } catch (err) {
          console.error('Failed to update user role:', err);
        }
      }
    }
    updateRole();
  }, [isSignedIn, user, clerk, router]);

  return <SignUp path="/vendor/new" routing="path" />;
}
