// app/(user)/bookings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BookingRequest {
  id: string;
  vendor_id: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  name: string;
  email: string;
}

export default function UserBookingHistoryPage() {
  const { user, isLoaded } = useUser();
  const supabase = createClientComponentClient();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchUserBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Failed to fetch user bookings:', error);
      } else {
        setRequests(data ?? []);
      }

      setLoading(false);
    };

    fetchUserBookings();
  }, [user, supabase]);

  if (!isLoaded || !user) return <p>Loading user...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Your Booking Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>You have not submitted any booking requests yet.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="border p-4 rounded bg-white shadow">
              <p className="text-lg font-semibold">Vendor ID: {req.vendor_id}</p>
              <p className="text-sm text-gray-600">
                Submitted on {new Date(req.date).toLocaleDateString()} at{' '}
                {new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium text-white ${
                  req.status === 'accepted'
                    ? 'bg-green-600'
                    : req.status === 'rejected'
                    ? 'bg-red-600'
                    : 'bg-yellow-500'
                }`}
              >
                {req.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
