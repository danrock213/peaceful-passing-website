'use client';

import { SignUp } from '@clerk/nextjs';

export default function VendorSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        path="/sign-up/vendor"
        routing="path"
        redirectUrl="/vendor-auth"
        // 👇 Correct way to set metadata
        initialValues={{
          // @ts-ignore: publicMetadata is valid at runtime
          publicMetadata: {
            role: 'vendor',
          },
        }}
      />
    </div>
  );
}
