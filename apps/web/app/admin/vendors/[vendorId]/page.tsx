'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const VendorInteractions = dynamic(
  () => import('@/components/vendor/VendorInteractions.client'),
  {
    ssr: false,
    loading: () => <p className="text-center p-6">Loading vendor details…</p>,
  }
);

export default function VendorInteractionsPage() {
  const params = useParams();
  const vendorId = typeof params?.vendorId === 'string' ? params.vendorId : null;

  if (!vendorId) {
    return <p className="p-6 text-red-600">Vendor ID not found in route.</p>;
  }

  return <VendorInteractions vendorId={vendorId} />;
}
