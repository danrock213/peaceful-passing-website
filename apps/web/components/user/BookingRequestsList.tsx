'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';

export interface BookingRequest {
  id: string;
  vendor_id: string;
  name: string;
  email: string;
  date: string; // ISO string
  message: string;
  status: 'pending' | 'approved' | 'declined';
}

export default function BookingRequestsList() {
  const { user, isSignedIn } = useUser();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !user?.emailAddresses[0]?.emailAddress) return;

    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('email', user.emailAddresses[0].emailAddress)
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
  }, [isSignedIn, user]);

  if (!isSignedIn) return <p>Please sign in to view your booking requests.</p>;
  if (loading) return <p>Loading your booking requests...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Your Booking Requests</h2>
      {requests.length === 0 && <p>You have no booking requests yet.</p>}
      <ul className="space-y-4">
        {requests.map((req) => (
          <li key={req.id} className="border p-4 rounded shadow">
            <p><strong>Vendor ID:</strong> {req.vendor_id}</p>
            <p><strong>Date:</strong> {new Date(req.date).toLocaleString()}</p>
            <p><strong>Message:</strong> {req.message}</p>
            <p><strong>Status:</strong> <em>{req.status}</em></p>
          </li>
        ))}
      </ul>
    </section>
  );
}
