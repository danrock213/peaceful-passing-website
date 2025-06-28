'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { VendorStatus, Vendor } from '@/types/vendor';

export default function AdminVendorListPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filter, setFilter] = useState<'all' | VendorStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isLoaded, user, isAdmin, router]);

  useEffect(() => {
    async function fetchVendors() {
      if (!isAdmin) return;

      setLoading(true);
      const { data, error } = await supabase.from('vendors').select('*');

      if (error) {
        setError(error.message);
      } else {
        const normalized = (data ?? []).map((v) => ({
          ...v,
          status: v.status || 'pending',
        }));
        setVendors(normalized);
      }

      setLoading(false);
    }

    fetchVendors();
  }, [isAdmin]);

  const logAdminAction = async (action: string, details: string) => {
    if (!user) return;
    await supabase.from('admin_activity_logs').insert({
      admin_id: user.id,
      action,
      details,
    });
  };

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
      const updatedVendor = data[0];
      await logAdminAction(
        `vendor.${status}`,
        `Vendor "${updatedVendor.name}" marked as ${status}`
      );

      setVendors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status } : v))
      );
    }
  };

  const filteredVendors =
    filter === 'all' ? vendors : vendors.filter((v) => v.status === filter);

  if (!isAdmin) return null;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Vendor Approvals</h1>

      <div className="mb-4 flex space-x-4">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as VendorStatus | 'all')}
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
        <p>Loading vendors...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Category</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Actions</th>
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
                  <td className="border p-2">{vendor.name}</td>
                  <td className="border p-2">{vendor.category}</td>
                  <td className="border p-2 capitalize">{vendor.status}</td>
                  <td className="border p-2 space-x-2">
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
