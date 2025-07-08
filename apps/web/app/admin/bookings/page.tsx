'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type BookingRequest = {
  id: string;
  name: string;
  email: string;
  vendor_id: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
};

export default function AdminBookingsPage() {
  const { user, isLoaded } = useUser();
  const supabase = createClientComponentClient();

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isAdmin = isLoaded && user?.unsafeMetadata?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to fetch booking requests:', error.message);
        setRequests([]);
      } else {
        setRequests(data ?? []);
      }

      setLoading(false);
    };

    fetchRequests();
  }, [isAdmin]);

  const logAdminAction = async (action: string, details: string) => {
    if (!user) return;

    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action_type: action,
      target_type: 'booking',
      target_id: 'N/A',
      details: { note: details },
    });
  };

  const updateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    setUpdatingId(id);

    const { error } = await supabase
      .from('booking_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Failed to update booking status:', error);
      alert('Failed to update status.');
      setUpdatingId(null);
      return;
    }

    const req = requests.find((r) => r.id === id);
    await logAdminAction(`booking.${newStatus}`, `Booking for ${req?.name ?? 'Unknown'} updated to ${newStatus}`);

    try {
      const res = await fetch('/api/notify-booking-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, newStatus }),
      });

      if (!res.ok) {
        console.error('Notification email failed:', await res.text());
        alert('Status updated, but email failed to send.');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setUpdatingId(null);
  };

  if (!isLoaded) return <p className="p-6">Loading user...</p>;
  if (!isAdmin) return <p className="p-6 text-red-600 font-semibold">Unauthorized</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Booking Requests</h1>

      {loading ? (
        <p>Loading booking requests...</p>
      ) : requests.length === 0 ? (
        <p>No booking requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="p-4 border rounded bg-white shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold">{req.name} ({req.email})</p>
                <p className="text-sm text-gray-600">Vendor ID: <code>{req.vendor_id}</code></p>
                <p className="text-sm text-gray-500">Date: {new Date(req.date).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-white text-xs ${
                  req.status === 'accepted'
                    ? 'bg-green-600'
                    : req.status === 'rejected'
                    ? 'bg-red-600'
                    : 'bg-yellow-500'
                }`}>
                  {req.status}
                </span>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, 'accepted')}
                    disabled={updatingId === req.id}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    {updatingId === req.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, 'rejected')}
                    disabled={updatingId === req.id}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    {updatingId === req.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
