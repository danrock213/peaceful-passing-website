'use client';

import { useState } from 'react';
import { vendors } from '@/data/vendors';
import { isLocationMatch, getCategoryLabel } from '@/lib/vendorUtils'; // ✅ NEW IMPORT
import Image from 'next/image';
import Link from 'next/link';

export default function VendorMarketplace() {
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredVendors = vendors.filter((vendor) => {
    const matchesLocation = isLocationMatch(locationSearch, vendor.location);
    const matchesCategory = !selectedCategory || vendor.category === selectedCategory;
    return matchesLocation && matchesCategory;
  });

  const categories = [
    'funeral-homes',
    'crematoriums',
    'florists',
    'grief-counselors',
    'estate-lawyers',
    'memorial-products',
    'event-venues',
  ];

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#1D3557]">Vendor Marketplace</h1>

      {/* Location Filter */}
      <input
        type="text"
        placeholder="Search by location (e.g., Tarrytown, NY)"
        value={locationSearch}
        onChange={(e) => setLocationSearch(e.target.value)}
        className="border px-4 py-2 rounded w-full max-w-md mb-4"
      />

      {/* Category Filters BELOW Location Search */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm ${
            selectedCategory === null
              ? 'bg-[#1D3557] text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategory === cat
                ? 'bg-[#1D3557] text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <p className="text-gray-500">No vendors match your search.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <li
              key={vendor.id}
              className="border rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[#1D3557]">
                  {vendor.name}
                </h2>
                <p className="text-sm text-gray-600">{vendor.location}</p>
                <p className="mt-1 text-sm text-gray-700">{vendor.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
