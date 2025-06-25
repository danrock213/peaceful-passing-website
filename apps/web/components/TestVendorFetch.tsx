'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Vendor } from '@/types/vendor';

export default function TestVendorFetch() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from('vendors').select('*');

      if (error) {
        console.error('Error fetching vendors:', error.message);
      } else {
        setVendors(data || []);
      }

      setLoading(false);
    };

    fetchVendors();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">🧪 Vendor Fetch Test</h2>
      {loading ? (
        <p>Loading vendors…</p>
      ) : vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <ul className="space-y-2">
          {vendors.map((vendor) => (
            <li key={vendor.id} className="border p-2 rounded">
              <strong>{vendor.name}</strong>
              <div className="text-sm text-gray-600">{vendor.category}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
