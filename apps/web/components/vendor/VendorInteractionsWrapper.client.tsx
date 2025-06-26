'use client';

import dynamic from 'next/dynamic';

const VendorInteractions = dynamic(() => import('./VendorInteractions.client'), {
  ssr: false,
  loading: () => <p>Loading vendor details...</p>,
});

interface VendorInteractionsWrapperProps {
  vendorId: string;
}

export default function VendorInteractionsWrapper({ vendorId }: VendorInteractionsWrapperProps) {
  return <VendorInteractions vendorId={vendorId} />;
}
