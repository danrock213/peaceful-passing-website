'use client';

import Link from 'next/link';
import Image from 'next/image';
import { vendorCategories } from '@/data/vendors';
import { getCategoryLabel } from '@/lib/vendorUtils';

export default function VendorMarketplacePage() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-[#1D3557] mb-8 text-center">Explore Vendor Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorCategories.map((category) => (
          <Link
            key={category.id}
            href={`/vendors/${category.id}`}
            className="block rounded-lg shadow hover:shadow-lg transition overflow-hidden border border-gray-200 bg-white"
          >
            <div className="relative w-full h-48">
              <Image
                src={category.imageUrl}
                alt={getCategoryLabel(category.id)}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h2 className="text-xl font-semibold text-[#1D3557] mb-1">
                {getCategoryLabel(category.id)}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
