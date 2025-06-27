'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Vendor {
  id: string;
  name: string;
}

export default function BookingFormPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('approved', true);

      if (error) console.error(error);
      else setVendors(data ?? []);
    };

    fetchVendors();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (!user || !selectedVendorId || !date || !location) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    const isoDate = date.toISOString();

    // Prevent duplicate booking check
    const { data: existing, error: dupError } = await supabase
      .from('booking_requests')
      .select('id')
      .eq('vendor_id', selectedVendorId)
      .eq('user_id', user.id)
      .eq('date', isoDate);

    if (dupError) {
      setError('Failed to check for duplicates.');
      setSubmitting(false);
      return;
    }

    if ((existing?.length ?? 0) > 0) {
      setError('You have already requested a booking with this vendor for the selected date.');
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('booking_requests').insert({
      user_id: user.id,
      vendor_id: selectedVendorId,
      date: isoDate,
      notes,
      location,
      name: user.fullName || user.username || 'User',
      email: user.emailAddresses?.[0]?.emailAddress || '',
      status: 'pending',
    });

    if (insertError) {
      setError('Failed to submit booking request.');
      console.error(insertError);
    } else {
      setSuccess(true);
      setSelectedVendorId('');
      setDate(null);
      setNotes('');
      setLocation('');
    }

    setSubmitting(false);
  };

  if (!isSignedIn) return <p className="p-4">Please sign in to request a booking.</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#1D3557]">Request a Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Vendor</label>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Date and Time</label>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Optional details about your request"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Booking request submitted!</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
