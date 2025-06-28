'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type UserRole = 'user' | 'vendor' | 'admin';

interface Profile {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export default function AdminUserManagementPage() {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<'all' | UserRole>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.publicMetadata?.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isLoaded, user, router]);

  // Fetch users
  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setProfiles(data ?? []);
      }

      setLoading(false);
    }

    if (isLoaded && user?.publicMetadata?.role === 'admin') {
      fetchProfiles();
    }
  }, [isLoaded, user, supabase]);

  const filtered = filter === 'all' ? profiles : profiles.filter((p) => p.role === filter);

  const handleChangeRole = async (id: string, newRole: UserRole) => {
    setUpdatingId(id);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      alert('Failed to update role');
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, role: newRole } : p))
      );
    }

    setUpdatingId(null);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 py-10">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-6">User Management</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {['all', 'user', 'vendor', 'admin'].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r as any)}
            className={`px-4 py-2 rounded ${
              filter === r
                ? 'bg-[#1D3557] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading users…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No users found for this filter.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border">Created</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="text-sm hover:bg-gray-50">
                <td className="p-2 border">{p.name || '—'}</td>
                <td className="p-2 border">{p.email}</td>
                <td className="p-2 border capitalize">{p.role}</td>
                <td className="p-2 border">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-2 border space-x-2">
                  {p.role !== 'admin' && (
                    <button
                      onClick={() => handleChangeRole(p.id, 'admin')}
                      disabled={updatingId === p.id}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                    >
                      Promote to Admin
                    </button>
                  )}
                  {p.role !== 'vendor' && (
                    <button
                      onClick={() => handleChangeRole(p.id, 'vendor')}
                      disabled={updatingId === p.id}
                      className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 text-xs"
                    >
                      Make Vendor
                    </button>
                  )}
                  {p.role !== 'user' && (
                    <button
                      onClick={() => handleChangeRole(p.id, 'user')}
                      disabled={updatingId === p.id}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs"
                    >
                      Make User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
