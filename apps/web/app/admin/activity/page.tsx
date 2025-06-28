'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type LogEntry = {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  created_at: string;
};

export default function AdminActivityPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isLoaded && user?.publicMetadata?.role === 'admin';

  // Access control
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/sign-in');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isLoaded, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
        setLogs([]);
      } else {
        setLogs(data ?? []);
      }

      setLoading(false);
    };

    fetchLogs();
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Admin Activity Feed</h1>

      {loading ? (
        <p>Loading activity log…</p>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      ) : logs.length === 0 ? (
        <p>No admin activity logged yet.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={log.id} className="p-4 bg-white rounded border shadow-sm">
              <p className="text-sm">
                <span className="font-semibold">{log.admin_email}</span> performed
                <span className="font-semibold mx-1">{log.action}</span> on
                <span className="font-semibold mx-1">{log.target_type}</span>
                <code className="text-sm text-gray-700 bg-gray-100 px-1 rounded">{log.target_id}</code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
