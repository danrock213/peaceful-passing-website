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
}

export default function PendingApprovalsPage() {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      alert('Access restricted to admins.');
      router.push('/');
    }
  }, [isLoaded, user, isAdmin, router]);

  useEffect(() => {
    async function fetchPending() {
      if (!isAdmin) return;

      setLoading(true);
      setError(null);

      try {
        const { data: vendors, error: vendorError } = await supabase
          .from('vendors')
          .select('id, name, description, created_at')
          .eq('approved', false);

        const { data: tributes, error: tributeError } = await supabase
          .from('tributes')
          .select('id, title, description, created_at')
          .is('approved', null);

        if (vendorError || tributeError) throw vendorError || tributeError;

        const combined: PendingItem[] = [
          ...(vendors || []).map((v) => ({
            id: v.id,
            name: v.name,
            type: 'vendor' as const,
            description: v.description,
            submittedAt: v.created_at,
          })),
          ...(tributes || []).map((t) => ({
            id: t.id,
            name: t.title,
            type: 'tribute' as const,
            description: t.description,
            submittedAt: t.created_at,
          })),
        ];

        setPendingItems(combined);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch pending items');
      } finally {
        setLoading(false);
      }
    }

    fetchPending();
  }, [isAdmin, supabase]);

  const handleApprove = async (item: PendingItem) => {
    setProcessingId(item.id);
    try {
      const { error } = await supabase
        .from(item.type === 'vendor' ? 'vendors' : 'tributes')
        .update({ approved: true })
        .eq('id', item.id);

      if (error) throw error;
      setPendingItems((items) => items.filter((i) => i.id !== item.id));
    } catch (e: any) {
      setError(e.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: PendingItem) => {
    setProcessingId(item.id);
    try {
      const { error } = await supabase
        .from(item.type === 'vendor' ? 'vendors' : 'tributes')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      setPendingItems((items) => items.filter((i) => i.id !== item.id));
    } catch (e: any) {
      setError(e.message || 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {loading ? (
        <p>Loading pending items…</p>
      ) : pendingItems.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <ul className="space-y-4">
          {pendingItems.map((item) => (
            <li key={item.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600 capitalize">Type: {item.type}</p>
              {item.description && <p className="mt-1">{item.description}</p>}
              {item.submittedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {new Date(item.submittedAt).toLocaleString()}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleApprove(item)}
                  disabled={processingId === item.id}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(item)}
                  disabled={processingId === item.id}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
