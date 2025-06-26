'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PendingItem {
  id: string;
  name: string;
  type: 'vendor' | 'tribute';
  description?: string;
  submittedAt?: string;
  [key: string]: any;
}

export default function PendingApprovalsPage() {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Role & auth check
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.publicMetadata?.role !== 'admin') {
        alert('Access restricted to admins.');
        router.push('/');
      }
    }
  }, [user, isLoaded, router]);

  // Fetch pending vendors and tributes
  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      setError(null);
      try {
        // Pending vendors (approved = false)
        const { data: vendors, error: vendorsError } = await supabase
          .from('vendors')
          .select('id, name, description, created_at')
          .eq('approved', false);

        if (vendorsError) throw vendorsError;

        // Pending tributes? Assuming they have a 'status' or 'approved' column; 
        // If not, you can customize this query
        const { data: tributes, error: tributesError } = await supabase
          .from('tributes')
          .select('id, title, description, created_at')
          .is('approved', null); // Or some condition if you track approval on tributes

        if (tributesError) throw tributesError;

        // Combine and normalize
        const combined: PendingItem[] = [
          ...(vendors?.map((v) => ({
            id: v.id,
            name: v.name,
            type: 'vendor' as const,
            description: v.description,
            submittedAt: v.created_at,
          })) || []),
          ...(tributes?.map((t) => ({
            id: t.id,
            name: t.title,
            type: 'tribute' as const,
            description: t.description,
            submittedAt: t.created_at,
          })) || []),
        ];

        setPendingItems(combined);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch pending items');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user?.publicMetadata?.role === 'admin') {
      fetchPending();
    }
  }, [isLoaded, user, supabase]);

  const handleApprove = async (item: PendingItem) => {
    setProcessingId(item.id);
    setError(null);

    try {
      if (item.type === 'vendor') {
        // Approve vendor by setting approved = true
        const { error: updateError } = await supabase
          .from('vendors')
          .update({ approved: true })
          .eq('id', item.id);

        if (updateError) throw updateError;
      } else if (item.type === 'tribute') {
        // For tributes, decide what "approve" means — here let's add an approved flag
        const { error: updateError } = await supabase
          .from('tributes')
          .update({ approved: true })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      setPendingItems((items) => items.filter((i) => i.id !== item.id));
      alert(`${item.type === 'vendor' ? 'Vendor' : 'Tribute'} approved!`);
    } catch (e: any) {
      setError(e.message || 'Failed to approve item');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: PendingItem) => {
    setProcessingId(item.id);
    setError(null);

    try {
      if (item.type === 'vendor') {
        // Reject by deleting the vendor row (or you could add a rejected status)
        const { error: deleteError } = await supabase
          .from('vendors')
          .delete()
          .eq('id', item.id);

        if (deleteError) throw deleteError;
      } else if (item.type === 'tribute') {
        // Reject by deleting the tribute
        const { error: deleteError } = await supabase
          .from('tributes')
          .delete()
          .eq('id', item.id);

        if (deleteError) throw deleteError;
      }

      setPendingItems((items) => items.filter((i) => i.id !== item.id));
      alert(`${item.type === 'vendor' ? 'Vendor' : 'Tribute'} rejected.`);
    } catch (e: any) {
      setError(e.message || 'Failed to reject item');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user || user.publicMetadata?.role !== 'admin') {
    return null;
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading pending items…</p>
      ) : pendingItems.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <ul className="space-y-4">
          {pendingItems.map((item) => (
            <li key={item.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">Type: {item.type}</p>
              {item.description && <p className="mt-2">{item.description}</p>}
              {item.submittedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {new Date(item.submittedAt).toLocaleString()}
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(item)}
                  disabled={processingId === item.id}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === item.id ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(item)}
                  disabled={processingId === item.id}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {processingId === item.id ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
