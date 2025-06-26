'use client';

import dynamic from 'next/dynamic';

const VendorInteractions = dynamic(
  () => import('@/components/vendor/VendorInteractions.client'),
  {
    ssr: false,
    loading: () => <p>Loading vendor details...</p>,
  }
);

export default VendorInteractions;
