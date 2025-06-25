'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface PendingItem {
  id: string;
  name: string;
  type: 'vendor' | 'tribute';
  description: string;
  submittedAt: string;
  [key: string]: any;
}

export default function PendingApprovalsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Role check
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

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role === 'admin') {
      const mockData: PendingItem[] = JSON.parse(
        localStorage.getItem('pendingApprovals') || '[]'
      );
      setPendingItems(mockData);
      setLoading(false);
    }
  }, [isLoaded, user]);

  const handleApprove = (id: string) => {
    const updated = pendingItems.filter((item) => item.id !== id);
    setPendingItems(updated);
    localStorage.setItem('pendingApprovals', JSON.stringify(updated));
    alert('Approved!');
  };

  const handleReject = (id: string) => {
    const updated = pendingItems.filter((item) => item.id !== id);
    setPendingItems(updated);
    localStorage.setItem('pendingApprovals', JSON.stringify(updated));
    alert('Rejected!');
  };

  if (!user || user.publicMetadata?.role !== 'admin') {
    return null; // Optionally render a loader here
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>
      {loading ? (
        <p>Loading...</p>
      ) : pendingItems.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <ul className="space-y-4">
          {pendingItems.map((item) => (
            <li key={item.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">Type: {item.type}</p>
              <p className="mt-2">{item.description}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
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
