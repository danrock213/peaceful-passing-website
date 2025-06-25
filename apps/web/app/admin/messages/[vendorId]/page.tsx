'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabaseClient';
import type { Message, Vendor } from '@/types/vendor';
import Link from 'next/link';

export default function AdminVendorMessagesPage() {
  const { vendorId } = useParams() as { vendorId: string };
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const supabase = createClient();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [markingRead, setMarkingRead] = useState(false);

  // Admin check - replace with your own logic or roles
  const adminEmails = ['admin@yourdomain.com'];
  const isAdmin = isSignedIn && user?.primaryEmailAddress?.emailAddress && adminEmails.includes(user.primaryEmailAddress.emailAddress);

  const fetchVendorAndMessages = useCallback(async () => {
    if (!isAdmin) {
      setError('You do not have permission to view this page.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Fetch vendor info
      const { data: vendorData, error: vendorError } = await supabase
        .from<Vendor>('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendorError || !vendorData) {
        setError('Vendor not found.');
        setLoading(false);
        return;
      }
      setVendor(vendorData);

      // Fetch messages for vendor, order ascending so oldest first
      const { data: messagesData, error: messagesError } = await supabase
        .from<Message>('messages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: true });

      if (messagesError) {
        throw messagesError;
      }
      setMessages(messagesData ?? []);
    } catch (err) {
      console.error(err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, supabase, vendorId]);

  useEffect(() => {
    fetchVendorAndMessages();
  }, [fetchVendorAndMessages]);

  // Mark all unread messages as read
  const markAllRead = async () => {
    setMarkingRead(true);
    try {
      const unreadMessageIds = messages.filter((m) => !m.read).map((m) => m.id);
      if (unreadMessageIds.length === 0) {
        setMarkingRead(false);
        return;
      }
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', unreadMessageIds);

      if (error) throw error;

      // Update local state
      setMessages((prev) =>
        prev.map((m) => ({ ...m, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark messages read:', err);
      setError('Failed to mark messages as read.');
    } finally {
      setMarkingRead(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError('');
    try {
      const messagePayload = {
        vendor_id: vendorId,
        sender: user?.firstName || 'Admin',
        content: newMessage.trim(),
        date: new Date().toISOString(),
        read: true, // Admin's own message is "read"
      };
      const { data, error } = await supabase
        .from('messages')
        .insert([messagePayload])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (!isSignedIn) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>Please sign in to access this page.</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <p>You do not have permission to access this page.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">
        Messages with Vendor: {vendor?.name || vendorId}
      </h1>

      <Link
        href="/admin/messages"
        className="inline-block mb-4 text-blue-600 underline"
      >
        ← Back to Vendor Messages List
      </Link>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <>
          <button
            onClick={markAllRead}
            disabled={markingRead}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {markingRead ? 'Marking read...' : 'Mark All as Read'}
          </button>

          <ul className="space-y-4 max-h-[400px] overflow-y-auto border rounded p-4 bg-white">
            {messages.length === 0 && (
              <li className="text-gray-500">No messages found.</li>
            )}
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-3 rounded ${
                  msg.read ? 'bg-gray-100' : 'bg-yellow-100 border border-yellow-400'
                }`}
              >
                <p className="text-sm text-gray-600 mb-1">
                  <strong>{msg.sender}</strong> on{' '}
                  {new Date(msg.date).toLocaleString()}
                  {!msg.read && <span className="ml-2 text-red-600 font-semibold">Unread</span>}
                </p>
                <p className="whitespace-pre-line text-gray-800">{msg.content}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <textarea
              rows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a reply..."
              className="w-full border rounded p-2 resize-none"
              disabled={sending}
              aria-label="Admin reply message"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="mt-3 bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#16324a] transition"
              type="button"
            >
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
