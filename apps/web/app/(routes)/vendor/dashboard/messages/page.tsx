'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import type { Message, Vendor } from '@/types/vendor';

export default function VendorMessagesDashboard() {
  const { isSignedIn, user } = useUser();
  const supabase = createClient();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchVendorAndMessages() {
      if (!isSignedIn || !user?.primaryEmailAddress?.emailAddress) return;

      setLoading(true);
      setError('');

      // 1. Look up vendor by email
      const { data: vendorData, error: vendorError } = await supabase
        .from<Vendor>('vendors')
        .select('*')
        .eq('email', user.primaryEmailAddress.emailAddress)
        .single();

      if (vendorError || !vendorData) {
        setError('No vendor profile found for this account.');
        setLoading(false);
        return;
      }

      setVendor(vendorData);

      // 2. Fetch messages for this vendor
      const { data: messagesData, error: messagesError } = await supabase
        .from<Message>('messages')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('date', { ascending: true });

      if (messagesError) {
        setError('Failed to load messages.');
      } else {
        setMessages(messagesData ?? []);
      }

      setLoading(false);
    }

    fetchVendorAndMessages();
  }, [isSignedIn, user]);

  const groupedBySender = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    if (!acc[msg.sender]) acc[msg.sender] = [];
    acc[msg.sender].push(msg);
    return acc;
  }, {});

  async function handleReply(sender: string) {
    const reply = replyText[sender]?.trim();
    if (!reply || !vendor) return;

    setSendingReply((prev) => ({ ...prev, [sender]: true }));

    const { error } = await supabase.from('messages').insert([
      {
        vendor_id: vendor.id,
        sender: vendor.name || 'Vendor',
        sender_type: 'vendor',
        content: reply,
        date: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert('Failed to send reply. Please try again.');
    } else {
      // Refetch messages after reply
      const { data } = await supabase
        .from<Message>('messages')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('date', { ascending: true });

      setMessages(data ?? []);
      setReplyText((prev) => ({ ...prev, [sender]: '' }));
    }

    setSendingReply((prev) => ({ ...prev, [sender]: false }));
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-[#1D3557]">Your Messages</h1>

      {loading && <p>Loading messages...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && messages.length === 0 && (
        <p className="text-gray-500">You haven't received any messages yet.</p>
      )}

      {!loading && Object.keys(groupedBySender).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedBySender).map(([sender, thread]) => (
            <div key={sender} className="border rounded p-4 bg-white shadow">
              <h2 className="text-lg font-semibold mb-2 text-[#1D3557]">Conversation with {sender}</h2>
              <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-2">
                {thread.map((msg) => (
                  <li key={msg.id}>
                    <p className="text-sm text-gray-600">
                      <strong>{msg.sender_type === 'vendor' ? 'You' : msg.sender}</strong>{' '}
                      <span className="text-gray-400 text-xs">({new Date(msg.date).toLocaleString()})</span>
                    </p>
                    <p className="text-gray-800 whitespace-pre-line">{msg.content}</p>
                  </li>
                ))}
              </ul>

              <textarea
                rows={2}
                className="w-full border rounded p-2 text-sm resize-none"
                placeholder="Type your reply..."
                value={replyText[sender] || ''}
                onChange={(e) =>
                  setReplyText((prev) => ({ ...prev, [sender]: e.target.value }))
                }
              />
              <button
                className="mt-2 px-4 py-2 bg-[#1D3557] text-white rounded hover:bg-[#16324a] disabled:opacity-50"
                onClick={() => handleReply(sender)}
                disabled={sendingReply[sender]}
              >
                {sendingReply[sender] ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
