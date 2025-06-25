import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/vendorUtils';
import VendorInteractions from '@/components/vendor/VendorInteractions.client';

interface Vendor {
  id: string;
  name: string;
  category: string;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  images?: string[] | null;
}

export default async function VendorDetailPage({
  params,
}: {
  params: { category: string; vendorId: string };
}) {
  const { category, vendorId } = params;

  const { data: vendor, error } = await supabase
    .from<Vendor>('vendors')
    .select('*')
    .eq('id', vendorId)
    .eq('category', category)
    .eq('approved', true)
    .single();

  if (error || !vendor) {
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
          vendor.images.map((img, idx) => (
            <div key={idx} className="relative w-64 h-40 flex-shrink-0 rounded overflow-hidden shadow">
              <Image src={img} alt={`${vendor.name} image ${idx + 1}`} fill className="object-cover" />
            </div>
          ))
        ) : vendor.imageUrl ? (
          <div className="relative w-64 h-40 rounded overflow-hidden shadow">
            <Image src={vendor.imageUrl} alt={`${vendor.name}`} fill className="object-cover" />
          </div>
        ) : (
          <p className="text-gray-500">No image available</p>
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

      <VendorInteractions vendorId={vendor.id} />
    </main>
  );
}
