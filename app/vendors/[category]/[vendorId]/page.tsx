'use client';

import { useParams, useRouter } from 'next/navigation';
import { vendors } from '@/data/vendors';
import Image from 'next/image';
import Link from 'next/link';

export default function VendorDetailPage() {
  const { category, vendorId } = useParams();
  const router = useRouter();

  // Validate category
  const categoryLabels: Record<string, string> = {
    'funeral-homes': 'Funeral Homes',
    crematoriums: 'Crematoriums',
    florists: 'Florists',
    'grief-counselors': 'Grief Counselors',
    'estate-lawyers': 'Estate Lawyers',
    'memorial-products': 'Memorial Products',
    'event-venues': 'Event Venues',
  };

  if (!category || !categoryLabels[category]) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-red-600">Invalid vendor category.</p>
        <Link href="/vendors" className="text-blue-600 underline">
          Back to Vendor Marketplace
        </Link>
      </main>
    );
  }

  // Find vendor by id & category
  const vendor = vendors.find(
    (v) => v.id === vendorId && v.category === category
  );

  if (!vendor) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-red-600">Vendor not found.</p>
        <Link href={`/vendors/${category}`} className="text-blue-600 underline">
          Back to {categoryLabels[category]}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 underline"
      >
        &larr; Back
      </button>
      <h1 className="text-4xl font-bold mb-4 text-[#1D3557]">{vendor.name}</h1>
      <div className="relative w-full h-64 mb-6 rounded overflow-hidden shadow-md">
        <Image
          src={vendor.imageUrl}
          alt={vendor.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 100vw"
        />
      </div>
      <p className="text-lg text-gray-700 mb-4">{vendor.description}</p>
      <p className="text-md text-gray-600 mb-2">
        <strong>Location:</strong> {vendor.location}
      </p>
      <p className="text-md text-gray-600 mb-2">
        <strong>Contact:</strong>{' '}
        {vendor.contactEmail ? (
          <a href={`mailto:${vendor.contactEmail}`} className="text-blue-600 underline">
            {vendor.contactEmail}
          </a>
        ) : (
          'N/A'
        )}
      </p>
      {vendor.website && (
        <p className="text-md text-gray-600 mb-2">
          <strong>Website:</strong>{' '}
          <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {vendor.website}
          </a>
        </p>
      )}
      {/* TODO: Add map here if you want */}
    </main>
  );
}
