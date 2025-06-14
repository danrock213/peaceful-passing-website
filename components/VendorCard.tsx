'use client';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryLabel } from '@/lib/vendorUtils';

interface Vendor {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string;
  reviews?: { rating: number }[];
}

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const reviews = vendor.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : null;

  return (
    <li className="cursor-pointer">
      <Link
        href={`/vendors/${vendor.category}/${vendor.id}`}
        className="block border rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="relative h-40 w-full">
          <Image
            src={vendor.imageUrl}
            alt={vendor.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-[#1D3557]">{vendor.name}</h2>
          <p className="text-sm text-gray-600">{vendor.location}</p>
          <p className="mt-2 text-gray-700 text-sm line-clamp-2">
            {vendor.description}
          </p>
          {avgRating !== null && (
            <p className="mt-2 text-sm text-yellow-600">
              ⭐ {avgRating.toFixed(1)} (
              <span className="underline text-blue-600">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
              )
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
