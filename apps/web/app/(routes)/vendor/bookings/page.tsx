'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BookingRequest {
  id: string;
  name: string;
  email: string;
  date: string;
  notes: string;
  location: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function VendorBookingsPage() {
  const { user, isSignedIn } = useUser();
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('vendor_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to fetch booking requests:', error);
      } else {
        setRequests(data ?? []);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [user?.id, supabase]);

  const updateStatus = async (id: string, newStatus: 'accepted' | 'rejected') => {
    setUpdatingId(id);

    const { error } = await supabase
      .from('booking_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Failed to update booking status.');
      console.error(error);
      setUpdatingId(null);
      return;
    }

    // Call the notification API to send email
    try {
      const res = await fetch('/api/notify-booking-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: id, newStatus }),
      });
      if (!res.ok) {
        console.error('Failed to send notification email:', await res.text());
        alert('Warning: Booking status updated but notification email failed.');
      }
    } catch (err) {
      console.error('Error sending notification email:', err);
      alert('Warning: Booking status updated but notification email failed.');
    }

    // Update UI optimistically
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    setUpdatingId(null);
  };

  if (!isSignedIn) return <p className="p-4">Please sign in to view your bookings.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Your Booking Requests</h1>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No booking requests found.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.id}
              className="p-4 border rounded bg-white shadow flex flex-col sm:flex-row sm:justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-lg">
                  {req.name} ({req.email})
                </p>
                <p className="text-sm text-gray-700 mt-1">📍 {req.location || 'N/A'}</p>
                <p className="text-sm text-gray-600">📅 {new Date(req.date).toLocaleString()}</p>
                {req.notes && (
                  <p className="text-sm mt-2 italic">📝 "{req.notes}"</p>
                )}
                <span
                  className={`mt-2 inline-block px-2 py-1 rounded text-white text-xs ${
                    req.status === 'accepted'
                      ? 'bg-green-600'
                      : req.status === 'rejected'
                      ? 'bg-red-600'
                      : 'bg-yellow-500'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2 self-end sm:self-center">
                  <button
                    onClick={() => updateStatus(req.id, 'accepted')}
                    disabled={updatingId === req.id}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, 'rejected')}
                    disabled={updatingId === req.id}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Reject
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
