'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type VendorListing = {
  id: string;
  title: string;
  category: string;
  location: string;
  active: boolean;
};

export default function VendorDashboardShell({
  businessName,
  listings,
  stats,
}: {
  businessName: string;
  listings: VendorListing[];
  stats: { views: number; leads: number; approved: boolean };
}) {
  const router = useRouter();
  const [vendorListings, setVendorListings] = useState(listings);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {businessName}!</h1>

      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Views" value={stats.views} />
        <StatCard label="Leads" value={stats.leads} />
        <StatCard label="Approved" value={stats.approved ? '✅' : '❌'} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
        {vendorListings.length > 0 ? (
          <ul className="space-y-4">
            {vendorListings.map((listing) => (
              <li key={listing.id} className="flex justify-between items-center border rounded p-4 bg-white">
                <div>
                  <p className="font-bold">{listing.title}</p>
                  <p className="text-sm text-gray-500">{listing.category} — {listing.location}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/vendor/listings/edit?id=${listing.id}`)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setVendorListings((prev) =>
                        prev.map((l) =>
                          l.id === listing.id ? { ...l, active: !l.active } : l
                        )
                      );
                    }}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    {listing.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">You haven’t added any listings yet.</p>
        )}
        <button
          onClick={() => router.push('/vendor/listings/edit')}
          className="mt-4 px-4 py-2 bg-[#1D3557] text-white rounded hover:bg-[#457B9D]"
        >
          + Add New Listing
        </button>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 bg-white border rounded shadow text-center">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
