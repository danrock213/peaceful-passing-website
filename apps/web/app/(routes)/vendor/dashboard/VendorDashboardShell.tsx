'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
  const supabase = createClientComponentClient();
  const [vendorListings, setVendorListings] = useState(listings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this listing?`)) return;

    setLoadingId(id);

    const { error } = await supabase
      .from('vendors')
      .update({ approved: !currentStatus })
      .eq('id', id);

    if (error) {
      alert(`Failed to update listing: ${error.message}`);
    } else {
      setVendorListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, active: !currentStatus } : l))
      );
    }

    setLoadingId(null);
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {businessName}!</h1>

      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Profile Views" value={stats.views} />
        <StatCard label="Leads" value={stats.leads} />
        <StatCard label="Approved" value={stats.approved ? '✅' : '❌'} />
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Listings</h2>
          <button
            onClick={() => router.push('/vendor/listings/edit')}
            className="px-4 py-2 bg-[#1D3557] text-white rounded hover:bg-[#457B9D]"
          >
            + Add New Listing
          </button>
        </div>

        {vendorListings.length > 0 ? (
          <ul className="space-y-4">
            {vendorListings.map((listing) => (
              <li key={listing.id} className="flex justify-between items-center border rounded p-4 bg-white shadow-sm">
                <div>
                  <p className="font-bold text-lg">{listing.title}</p>
                  <p className="text-sm text-gray-500">{listing.category} — {listing.location}</p>
                  <p className="text-xs text-gray-400 mt-1">Last updated: recently</p>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                      listing.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {listing.active ? 'Approved & Live' : 'Pending Approval'}
                  </span>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    onClick={() => router.push(`/vendor/listings/edit?id=${listing.id}`)}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    disabled={loadingId === listing.id}
                    onClick={() => toggleActiveStatus(listing.id, listing.active)}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                  >
                    {loadingId === listing.id
                      ? 'Updating…'
                      : listing.active
                      ? 'Deactivate'
                      : 'Activate'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-600 mt-4">
            <p>You haven’t added any vendor listings yet.</p>
            <button
              onClick={() => router.push('/vendor/listings/edit')}
              className="mt-3 px-4 py-2 bg-[#1D3557] text-white rounded hover:bg-[#457B9D]"
            >
              Create Your First Listing
            </button>
          </div>
        )}
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
