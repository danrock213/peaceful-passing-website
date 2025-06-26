'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface BookingRequest {
  id: string;
  vendor_id: string;
  name: string;
  email: string;
  date: string; // ISO string
  message: string;
  status: 'pending' | 'approved' | 'declined';
}

interface BookingRequestsManagerProps {
  vendorId: string;
}

export default function BookingRequestsManager({ vendorId }: BookingRequestsManagerProps) {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: false });

      if (error) {
        setError('Failed to load booking requests');
        console.error(error);
      } else {
        setRequests(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    fetchRequests();
  }, [vendorId]);

  const updateStatus = async (id: string, newStatus: 'approved' | 'declined') => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Failed to update status');
      console.error(error);
      return;
    }

    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );

    // Call API route to send notification email
    await fetch('/api/notify-booking-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: id, newStatus }),
    });
  };

  if (loading) return <p>Loading booking requests...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Booking Requests</h2>
      {requests.length === 0 && <p>No booking requests yet.</p>}
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="border p-4 rounded shadow">
            <p><strong>Name:</strong> {req.name}</p>
            <p><strong>Email:</strong> {req.email}</p>
            <p><strong>Date:</strong> {new Date(req.date).toLocaleString()}</p>
            <p><strong>Message:</strong> {req.message}</p>
            <p><strong>Status:</strong> <em>{req.status}</em></p>
            {req.status === 'pending' && (
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => updateStatus(req.id, 'approved')}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(req.id, 'declined')}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Decline
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
