'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { vendorCategories, vendors } from '@/data/vendors';
import { useGeocode } from '@/hooks/useGeocode';
import { getDistanceInKm } from '@/utils/geocode';
import { isLocationMatch } from '@/lib/vendorUtils';
import VendorCard from '@/components/VendorCard';
import Image from 'next/image';

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function VendorCategoryPage() {
  const { category } = useParams();
  const [locationSearch, setLocationSearch] = useState('');
  const [radius, setRadius] = useState(50);
  const { coords: searchCoords, loading } = useGeocode(locationSearch);

  const categoryId = typeof category === 'string' ? category : '';
  const categoryMeta = vendorCategories.find((cat) => cat.id === categoryId);

  if (!categoryMeta) {
    return (
      <main className="max-w-5xl mx-auto p-6">
        <p className="text-red-600">Invalid vendor category.</p>
        <a href="/vendors" className="text-blue-600 underline">
          Back to Vendor Marketplace
        </a>
      </main>
    );
  }

  // Filter vendors by category
  let filteredVendors = vendors.filter((v) => v.category === categoryId);

  // Optional: location-based filtering
  if (searchCoords) {
    filteredVendors = filteredVendors.filter((v) => {
      if (!v.lat || !v.lng) return false;
      const distance = getDistanceInKm(searchCoords.lat, searchCoords.lng, v.lat, v.lng);
      const locationMatch = isLocationMatch(locationSearch, v.location);
      return distance <= radius && locationMatch;
    });
  } else if (locationSearch.trim() !== '') {
    filteredVendors = filteredVendors.filter((v) =>
      isLocationMatch(locationSearch, v.location)
    );
  }

  return (
    <main>
      {/* Hero Section */}
      <div className="relative h-64 w-full mb-8">
        <Image
          src={categoryMeta.imageUrl}
          alt={categoryMeta.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl font-bold mb-2">{categoryMeta.name}</h1>
          <p className="text-lg max-w-2xl">{categoryMeta.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        {/* Location Filter */}
        <div className="mb-6 space-y-2">
          <input
            type="text"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder="Search by location (e.g. New York City)"
            className="border p-2 rounded w-full max-w-md"
          />
          {loading && <p className="text-gray-500">Searching location...</p>}
          {searchCoords && (
            <div>
              <label htmlFor="radius" className="text-sm font-medium text-gray-700 mr-2">
                Radius:
              </label>
              <select
                id="radius"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="border p-1 rounded"
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    Within {r} km
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
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
