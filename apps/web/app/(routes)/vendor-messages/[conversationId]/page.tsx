"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "vendor";
  content: string;
  timestamp: string;
};

export default function VendorConversationPage() {
  const params = useParams();

  // Defensive: conversationId might be undefined or an array (unlikely but possible)
  const conversationId =
    params && typeof params.conversationId === "string"
      ? params.conversationId
      : "unknown";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "vendor",
      content: "Thanks for reaching out! How can I help?",
      timestamp: "2025-06-10T10:01:00Z",
    },
    {
      id: "2",
      sender: "user",
      content: "Hi, I’m interested in your services.",
      timestamp: "2025-06-10T10:00:00Z",
    },
  ]);

  const [newMessage, setNewMessage] = useState<string>("");

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const messageToAdd: Message = {
      id: String(messages.length + 1),
      sender: "vendor",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageToAdd]);
    setNewMessage("");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <Link href="/vendor-messages" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Conversations
      </Link>

      <h1 className="text-3xl font-bold mb-4">Conversation {conversationId}</h1>

      <div
        className="flex-grow overflow-auto mb-4 flex flex-col space-y-3"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded max-w-[80%] ${
              msg.sender === "user" ? "bg-blue-100 self-start" : "bg-green-100 self-end"
            }`}
            aria-label={`${msg.sender === "user" ? "User" : "You"} said`}
          >
            <p>{msg.content}</p>
            <small className="text-gray-500 text-xs">{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex space-x-3"
        aria-label="Send new message"
      >
        <input
          type="text"
          className="flex-grow border rounded p-2"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          aria-label="Message input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </main>
  );
}
