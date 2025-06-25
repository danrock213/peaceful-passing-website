'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabaseClient';
import type { Vendor } from '@/types/vendor';

interface VendorUnread {
  vendor: Vendor;
  unreadCount: number;
}

export default function AdminMessagesList() {
  const { isSignedIn, user } = useUser();
  const supabase = createClient();

  const [vendors, setVendors] = useState<VendorUnread[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      setError('Please sign in as admin.');
      return;
    }

    // TODO: Replace this with real admin check
    const adminEmails = ['admin@yourdomain.com'];
    if (!user?.primaryEmailAddress?.emailAddress || !adminEmails.includes(user.primaryEmailAddress.emailAddress)) {
      setError('You do not have permission to view this page.');
      return;
    }

    const fetchVendorsWithUnread = async () => {
      setLoading(true);
      setError('');

      try {
        // Get all vendors that have messages with unread counts
        // Join vendors with messages grouped by vendor_id where read = false
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('vendor_id, read')
          .eq('read', false);

        if (msgError) throw msgError;

        const unreadCountMap = new Map<string, number>();
        messagesData?.forEach((msg) => {
          if (msg.vendor_id) {
            unreadCountMap.set(msg.vendor_id, (unreadCountMap.get(msg.vendor_id) ?? 0) + 1);
          }
        });

        // Fetch vendor info for all vendor_ids with messages
        const vendorIds = Array.from(unreadCountMap.keys());
        if (vendorIds.length === 0) {
          setVendors([]);
          setLoading(false);
          return;
        }

        const { data: vendorsData, error: vendorsError } = await supabase
          .from<Vendor>('vendors')
          .select('*')
          .in('id', vendorIds);

        if (vendorsError) throw vendorsError;

        const vendorsWithUnread: VendorUnread[] = (vendorsData ?? []).map((v) => ({
          vendor: v,
          unreadCount: unreadCountMap.get(v.id) ?? 0,
        }));

        setVendors(vendorsWithUnread);
      } catch (err) {
        console.error(err);
        setError('Failed to load vendor messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorsWithUnread();
  }, [isSignedIn, user, supabase]);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Vendor Messages Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading && <p>Loading vendors with unread messages...</p>}

      {!loading && vendors.length === 0 && <p>No vendors have unread messages.</p>}

      <ul className="space-y-4">
        {vendors.map(({ vendor, unreadCount }) => (
          <li
            key={vendor.id}
            className="p-4 border rounded flex justify-between items-center bg-white shadow-sm"
          >
            <Link href={`/admin/messages/${vendor.id}`} className="font-semibold text-lg text-blue-600 hover:underline">
              {vendor.name}
            </Link>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount} unread
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
