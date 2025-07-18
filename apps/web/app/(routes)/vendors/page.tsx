'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { vendorCategories } from '@/data/vendors';
import { haversineDistance } from '@/lib/geoUtils';
import { geocodeCity } from '@/lib/geocode';
import { useDebounce } from '@/lib/useDebounce';

interface Vendor {
  id: string;
  name: string;
  category: string;
  lat?: number | null;
  lng?: number | null;
  approved: boolean;
  imageUrl?: string | null;
  location?: string | null;
}

export default function VendorMarketplacePage() {
  const { isSignedIn } = useUser();

  const [city, setCity] = useState('');
  const debouncedCity = useDebounce(city, 500);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(75);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('approved', true);

        if (error) {
          setError('Failed to load vendors.');
          setVendors([]);
        } else {
          setVendors(data ?? []);
        }
      } catch {
        setError('Unexpected error loading vendors.');
        setVendors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, []);

  useEffect(() => {
    if (!debouncedCity) {
      setUserCoords(null);
      setRadius(75);
      return;
    }

    async function fetchCoords() {
      setLoading(true);
      setError('');
      try {
        const coords = await geocodeCity(debouncedCity);
        if (!coords) {
          setError('Could not find that location. Please try again.');
          setUserCoords(null);
        } else {
          setUserCoords(coords);
          setRadius(75);
        }
      } catch {
        setError('An error occurred while looking up that location.');
        setUserCoords(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCoords();
  }, [debouncedCity]);

  function vendorsNearby(categoryId: string) {
    if (!userCoords) return true;

    const vendorsInCategory = vendors.filter((v) => v.category === categoryId);
    const nearby = vendorsInCategory.filter(
      (v) =>
        v.lat != null &&
        v.lng != null &&
        haversineDistance(userCoords.lat, userCoords.lng, v.lat, v.lng) <= radius
    );

    if (nearby.length > 0) return true;

    const fallback = vendorsInCategory.filter(
      (v) =>
        v.lat != null &&
        v.lng != null &&
        haversineDistance(userCoords.lat, userCoords.lng, v.lat, v.lng) <= 150
    );

    if (fallback.length > 0) {
      setRadius(150);
      return true;
    }

    return false;
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-[#1D3557] mb-2 text-center">Vendor Marketplace</h1>

      {!isSignedIn && (
        <p className="text-center text-sm text-gray-500 mb-6">
          You’re browsing as a guest. Sign in to message vendors or save favorites.
        </p>
      )}

      <form
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Search vendors by city"
      >
        <input
          type="text"
          placeholder="Enter your city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
          aria-label="City search input"
        />
      </form>

      {loading && <p className="text-center text-gray-500 mb-4">Searching nearby vendors...</p>}
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorCategories
          .filter((cat) => vendorsNearby(cat.id))
          .map((cat) => (
            <Link
              key={cat.id}
              href={`/vendors/${cat.id}`}
              className="block border rounded shadow hover:shadow-lg transition"
            >
              <div className="relative w-full h-48">
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-[#1D3557]">{cat.name}</h2>
                <p className="text-sm text-gray-600 line-clamp-2">{cat.description}</p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  {vendors.filter((v) => v.category === cat.id).length} vendor
                  {vendors.filter((v) => v.category === cat.id).length !== 1 ? 's' : ''}
                </p>
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}
