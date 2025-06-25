import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/vendorUtils';
import VendorInteractionsWrapper from '@/components/vendor/VendorInteractionsWrapper.client';
import type { Vendor } from '@/types/vendor';

export default async function VendorDetailPage({
  params,
}: {
  params: any;  // <-- changed to 'any' to fix TS type errors
}) {
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
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">Vendor not found.</p>
        <Link href={`/vendors/${category}`} className="text-blue-600 underline">
          Back to {getCategoryLabel(category)}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href={`/vendors/${category}`} className="text-blue-600 underline mb-4 inline-block">
        &larr; Back to {getCategoryLabel(category)}
      </Link>

      <h1 className="text-4xl font-bold text-[#1D3557] mb-4">{vendor.name}</h1>

      <div className="flex gap-4 overflow-x-auto mb-6">
        {vendor.images?.length ? (
          vendor.images.map((img, idx) =>
            typeof img === 'string' ? (
              <div key={idx} className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow">
                <Image src={img} alt={`${vendor.name} image ${idx + 1}`} fill className="object-cover" />
              </div>
            ) : null
          )
        ) : (
          <p className="text-gray-500">No images available</p>
        )}
      </div>

      <p className="mb-6 text-gray-700 whitespace-pre-line">{vendor.description}</p>

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
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {vendor.website}
            </a>
          </p>
        )}
      </div>

      <VendorInteractionsWrapper vendorId={vendor.id} />
    </main>
  );
}
