'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Tribute = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  approved: boolean | null;
};

export default function PendingApprovalsPage() {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isLoaded, user, router, isAdmin]);

  useEffect(() => {
    const fetchPendingTributes = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tributes')
        .select('*')
        .is('approved', null)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTributes(data ?? []);
      }

      setLoading(false);
    };

    if (isLoaded && isAdmin) {
      fetchPendingTributes();
    }
  }, [isLoaded, isAdmin]);

  const logAdminAction = async (action: string, details: string) => {
    if (!user) return;
    await supabase.from('admin_activity_logs').insert({
      admin_id: user.id,
      action,
      details,
    });
  };

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const approvedValue = status === 'approved';

    const { error } = await supabase
      .from('tributes')
      .update({ approved: approvedValue })
      .eq('id', id);

    if (error) {
      alert('Failed to update status.');
    } else {
      await logAdminAction(`tribute.${status}`, `Marked tribute ID ${id} as ${status}`);
      setTributes((prev) => prev.filter((t) => t.id !== id));
    }

    setProcessingId(null);
  };

  if (!isLoaded) return <p className="p-6">Loading user…</p>;
  if (!isAdmin) return null;

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Pending Tribute Approvals</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading tributes…</p>
      ) : tributes.length === 0 ? (
        <p className="text-gray-500">No pending tributes found.</p>
      ) : (
        <ul className="space-y-4">
          {tributes.map((t) => (
            <li key={t.id} className="p-4 bg-white border rounded shadow-sm">
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.description?.slice(0, 120)}…</p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {new Date(t.created_at).toLocaleString()}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  onClick={() => handleStatusChange(t.id, 'approved')}
                  disabled={processingId === t.id}
                >
                  {processingId === t.id ? 'Approving…' : 'Approve'}
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  onClick={() => handleStatusChange(t.id, 'rejected')}
                  disabled={processingId === t.id}
                >
                  {processingId === t.id ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
