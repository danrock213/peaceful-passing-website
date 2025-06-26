'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { VendorStatus, Vendor } from '@/types/vendor';

export default function AdminVendorListPage() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState<'all' | VendorStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendors from Supabase
  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      const { data, error } = await supabase.from('vendors').select('*');

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []).map((v) => ({
        ...v,
        status: v.status || 'pending',
      }));

      setVendors(normalized);
      setLoading(false);
    }

    if (isSignedIn && user?.publicMetadata?.role === 'admin') {
      fetchVendors();
    }
  }, [isSignedIn, user]);

  // Protect route
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect_url=/admin/vendors');
    } else if (user && user.publicMetadata?.role !== 'admin') {
      router.push('/');
    }
  }, [isSignedIn, user, router]);

  const handleUpdateStatus = async (id: string, status: VendorStatus) => {
    const { data, error } = await supabase
      .from('vendors')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      alert('Failed to update vendor: ' + error.message);
      return;
    }

    if (data && data.length > 0) {
      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status } : v))
      );
    }
  };

  const filteredVendors =
    filter === 'all' ? vendors : vendors.filter((v) => v.status === filter);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">
        Vendor Approvals
      </h1>

      <div className="mb-4 flex space-x-4">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-[#1D3557] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading vendors...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  No vendors to show.
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{vendor.name}</td>
                  <td className="border border-gray-300 p-2">{vendor.category}</td>
                  <td className="border border-gray-300 p-2 capitalize">
                    {vendor.status}
                  </td>
                  <td className="border border-gray-300 p-2 space-x-2">
                    {vendor.status !== 'approved' && (
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() => handleUpdateStatus(vendor.id, 'approved')}
                      >
                        Approve
                      </button>
                    )}
                    {vendor.status !== 'rejected' && (
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleUpdateStatus(vendor.id, 'rejected')}
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
