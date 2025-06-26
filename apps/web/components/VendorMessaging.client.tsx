'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  vendor_id: string;
  sender: string; // user id or vendor id
  content: string;
  date: string;
  sender_type: 'user' | 'vendor';
  read: boolean;
}

interface Props {
  vendorId: string;
}

export default function VendorMessaging({ vendorId }: Props) {
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchMessages() {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error.message);
      } else if (data) {
        setMessages(data);
      }
      setLoading(false);
    }

    fetchMessages();

    // Optional: polling every 10s
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [vendorId, supabase, user, isLoaded]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);

    const messageToSend: Omit<Message, 'id' | 'date'> = {
      vendor_id: vendorId,
      sender: user.id,
      content: newMessage.trim(),
      sender_type: 'user',
      read: false,
    };

    const { data, error } = await supabase.from('messages').insert([messageToSend]).select().single();

    if (error) {
      console.error('Error sending message:', error.message);
      alert('Failed to send message.');
    } else if (data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) return <p>Loading messages...</p>;

  return (
    <div className="border rounded p-4 max-w-md mx-auto flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.length === 0 && <p className="text-center text-gray-500">No messages yet.</p>}

        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user' && msg.sender === user?.id;
          return (
            <div
              key={msg.id}
              className={`max-w-[75%] p-2 rounded ${
                isUser ? 'bg-blue-600 text-white self-end' : 'bg-gray-200 text-gray-900 self-start'
              }`}
            >
              <p>{msg.content}</p>
              <small className="block text-xs mt-1 text-gray-300">
                {new Date(msg.date).toLocaleString()}
              </small>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <textarea
          className="flex-grow border rounded p-2 resize-none"
          rows={2}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          placeholder="Type your message..."
          aria-label="New message input"
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
