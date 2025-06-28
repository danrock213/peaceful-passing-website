'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Tribute = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  approved: boolean | null;
};

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminTributesPage() {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';

  // Protect the page
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isLoaded, user, isAdmin, router]);

  // Fetch tributes
  useEffect(() => {
    async function fetchTributes() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('tributes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setTributes(data ?? []);
      }

      setLoading(false);
    }

    if (isAdmin) {
      fetchTributes();
    }
  }, [isAdmin]);

  const logAdminAction = async (action: string, details: string) => {
    if (!user) return;
    await supabase.from('admin_activity_logs').insert({
      admin_id: user.id,
      action,
      details,
    });
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    const approvedValue = status === 'approved';

    const { error } = await supabase
      .from('tributes')
      .update({ approved: approvedValue })
      .eq('id', id);

    if (error) {
      alert('Failed to update status');
    } else {
      const tribute = tributes.find((t) => t.id === id);
      await logAdminAction(
        `tribute.${status}`,
        `Tribute "${tribute?.title || 'Untitled'}" (${id}) marked as ${status}`
      );
      setTributes((prev) =>
        prev.map((t) => (t.id === id ? { ...t, approved: approvedValue } : t))
      );
    }

    setProcessingId(null);
  };

  // Filter + search
  const filteredTributes = tributes.filter((t) => {
    const matchesStatus =
      filter === 'all' ||
      (filter === 'pending' && t.approved === null) ||
      (filter === 'approved' && t.approved === true) ||
      (filter === 'rejected' && t.approved === false);

    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (!isAdmin) return null;

  return (
    <main className="max-w-5xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Manage Tributes</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-[#1D3557] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}

        <input
          type="text"
          placeholder="Search tributes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border border-gray-300 px-3 py-2 rounded text-sm w-full sm:w-64"
        />
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading ? (
        <p>Loading tributes…</p>
      ) : filteredTributes.length === 0 ? (
        <p className="text-gray-500">No tributes match this filter.</p>
      ) : (
        <ul className="space-y-4">
          {filteredTributes.map((t) => (
            <li key={t.id} className="p-4 bg-white border rounded shadow-sm">
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <p className="text-sm text-gray-600">
                {t.description?.slice(0, 160) || 'No description'}…
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted: {new Date(t.created_at).toLocaleString()}
              </p>

              <div className="mt-3 flex gap-2">
                {t.approved !== true && (
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    onClick={() => handleUpdateStatus(t.id, 'approved')}
                    disabled={processingId === t.id}
                  >
                    {processingId === t.id ? 'Approving…' : 'Approve'}
                  </button>
                )}
                {t.approved !== false && (
                  <button
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    onClick={() => handleUpdateStatus(t.id, 'rejected')}
                    disabled={processingId === t.id}
                  >
                    {processingId === t.id ? 'Rejecting…' : 'Reject'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
