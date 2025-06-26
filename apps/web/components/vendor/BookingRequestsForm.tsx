'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface BookingRequestFormProps {
  vendorId: string;
}

export default function BookingRequestForm({ vendorId }: BookingRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !date) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSuccess('');

    const newRequest = {
      vendor_id: vendorId,
      name,
      email,
      date: new Date(date).toISOString(),
      message,
      status: 'pending',
    };

    const { error } = await supabase.from('booking_requests').insert([newRequest]);

    if (error) {
      setError('Failed to submit booking request.');
      console.error(error);
    } else {
      setSuccess('Booking request submitted successfully!');
      setName('');
      setEmail('');
      setDate('');
      setMessage('');
    }
  };

  return (
    <section className="border p-4 rounded bg-gray-50">
      <h2 className="text-2xl font-semibold mb-4">Request a Booking</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <label className="block mb-1 font-medium">Name *</label>
      <input
        type="text"
        className="w-full border rounded p-2 mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="block mb-1 font-medium">Email *</label>
      <input
        type="email"
        className="w-full border rounded p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="block mb-1 font-medium">Booking Date & Time *</label>
      <input
        type="datetime-local"
        className="w-full border rounded p-2 mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className="block mb-1 font-medium">Message</label>
      <textarea
        rows={3}
        className="w-full border rounded p-2 mb-3 resize-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
      >
        Submit Booking Request
      </button>
    </section>
  );
}
