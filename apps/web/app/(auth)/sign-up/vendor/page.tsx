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
            // 🛠️ We cast to `any` because Clerk’s types don't expose `unsafeMetadata` on initialValues
            unsafeMetadata: {
              role: 'vendor',
            },
          } as any
        }
      />
    </div>
  );
}
