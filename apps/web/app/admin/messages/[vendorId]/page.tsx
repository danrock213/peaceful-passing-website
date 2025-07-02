'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Message } from '@/types/vendor';

export default function AdminVendorMessagesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = isLoaded && user?.unsafeMetadata?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching messages:', error.message);
      else setMessages(data ?? []);
      setLoading(false);
    };

    fetchMessages();
  }, [isAdmin]);

  if (!isLoaded) return <p className="p-6">Loading user…</p>;
  if (!isAdmin) return <p className="p-6 text-red-600 font-semibold">Unauthorized</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vendor Messages</h1>

      {loading ? (
        <p>Loading messages…</p>
      ) : messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="p-4 bg-white border rounded shadow">
              <p><strong>From:</strong> {msg.sender_type}</p>
              <p><strong>Message:</strong> {msg.content}</p>
              <p className="text-sm text-gray-500">
                {msg.created_at
                  ? new Date(msg.created_at).toLocaleString()
                  : 'Unknown date'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
