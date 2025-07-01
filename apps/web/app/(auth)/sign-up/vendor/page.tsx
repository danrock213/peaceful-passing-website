'use client';

import { SignUp } from '@clerk/nextjs';

export default function VendorSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        path="/sign-up/vendor"
        routing="path"
        redirectUrl="/vendor-auth"
        initialValues={
          {
            // `publicMetadata` is valid at runtime but not yet typed, so we cast
            publicMetadata: {
              role: 'vendor',
            },
          } as any
        }
      />
    </div>
  );
}
