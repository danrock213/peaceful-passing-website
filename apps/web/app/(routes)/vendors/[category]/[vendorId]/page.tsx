import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/vendorUtils';
import VendorInteractionsWrapper from '@/components/vendor/VendorInteractionsWrapper.client';
import type { Vendor } from '@/types/vendor';
import { notFound } from 'next/navigation';

export default async function VendorDetailPage({ params }: { params: any }) {
  const { category, vendorId } = params;
  const supabase = createClient();

  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', vendorId)
    .eq('category', category)
    .eq('approved', true)
    .single<Vendor>();

  if (error || !vendor) {
    console.error('Error fetching vendor:', error);
    notFound();
  }

  // Ensure images is an array of strings or empty array
  const images = Array.isArray(vendor.images)
    ? vendor.images.filter((img): img is string => typeof img === 'string')
    : [];

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href={`/vendors/${category}`} className="text-blue-600 underline mb-4 inline-block">
        &larr; Back to {getCategoryLabel(category)}
      </Link>

      <h1 className="text-4xl font-bold text-[#1D3557] mb-4">{vendor.name}</h1>

      <div className="flex gap-4 overflow-x-auto mb-6">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <div
              key={idx}
              className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow"
            >
              <Image
                src={img}
                alt={`${vendor.name} image ${idx + 1}`}
                fill
                className="object-cover"
                priority={idx === 0} // prioritize first image
              />
            </div>
          ))
        ) : (
          <div className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow bg-gray-100 flex items-center justify-center text-gray-400">
            No images available
          </div>
        )}
      </div>

      <p className="mb-6 text-gray-700 whitespace-pre-line">{vendor.description ?? 'No description provided.'}</p>

      <div className="mb-6 space-y-1 text-gray-800">
        {vendor.location && <p><strong>Location:</strong> {vendor.location}</p>}
        {vendor.phone && (
          <p>
            <strong>Phone:</strong>{' '}
            <a href={`tel:${vendor.phone}`} className="text-blue-600 underline">
              {vendor.phone}
            </a>
          </p>
        )}
        {vendor.email && (
          <p>
            <strong>Email:</strong>{' '}
            <a href={`mailto:${vendor.email}`} className="text-blue-600 underline">
              {vendor.email}
            </a>
          </p>
        )}
        {vendor.website && (
          <p>
            <strong>Website:</strong>{' '}
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {vendor.website}
            </a>
          </p>
        )}
      </div>

      <VendorInteractionsWrapper vendorId={vendor.id} />
    </main>
  );
}
