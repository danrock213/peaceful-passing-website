'use client';

import { SignUp } from '@clerk/nextjs';

export default function VendorSignUpPage() {
  // Runtime-only metadata injection
  const unsafeInitialValues = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...( { publicMetadata: { role: 'vendor' } } as any ),
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp
        path="/sign-up/vendor"
        routing="path"
        redirectUrl="/vendor-auth"
        initialValues={unsafeInitialValues}
      />
    </div>
  );
}
