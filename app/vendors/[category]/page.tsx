'use client';

import { useParams } from 'next/navigation';
import { vendors } from '@/data/vendors';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useGeocode } from '@/hooks/useGeocode';
import { getDistanceInKm } from '@/utils/geocode';
import { isLocationMatch, getCategoryLabel } from '@/lib/vendorUtils';

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function VendorCategoryPage() {
  const { category } = useParams();
  const [locationSearch, setLocationSearch] = useState('');
  const [radius, setRadius] = useState(50); // default radius
  const { coords: searchCoords, loading } = useGeocode(locationSearch);

  const readableCategory = typeof category === 'string' ? getCategoryLabel(category) : null;

  if (!category || !readableCategory) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-red-600">Invalid vendor category.</p>
        <Link href="/vendors" className="text-blue-600 underline">
          Back to Vendor Marketplace
        </Link>
      </main>
    );
  }

  // Filter vendors by category
  let filteredVendors = vendors.filter((v) => v.category === category);

  // If geocoded coordinates are available, filter by distance
  if (searchCoords) {
    filteredVendors = filteredVendors.filter((v) => {
      if (!v.lat || !v.lng) return false;
      const distance = getDistanceInKm(searchCoords.lat, searchCoords.lng, v.lat, v.lng);
      return distance <= radius;
    });
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#1D3557]">{readableCategory}</h1>

      {/* Location + Radius Filters */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          placeholder="Search vendors by location (e.g. New York City)"
          className="border p-2 rounded w-full max-w-md"
        />
        {loading && <p className="text-gray-500">Searching location...</p>}

        {searchCoords && (
          <div>
            <label htmlFor="radius" className="text-sm font-medium text-gray-700 mr-2">
              Search radius:
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="border p-1 rounded"
            >
              {RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  Within {km} km
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <p className="text-gray-500">No vendors found in this category and location.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => (
            <li
              key={vendor.id}
              className="border rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => alert('Vendor detail page not implemented yet')}
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
                <p className="mt-2 text-gray-700 text-sm">{vendor.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
