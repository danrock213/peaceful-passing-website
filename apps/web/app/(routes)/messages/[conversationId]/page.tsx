"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  sender: "user" | "vendor";
  content: string;
  timestamp: string;
};

export default function ConversationPage() {
  const params = useParams();
  // params.conversationId can be string | string[] | undefined, so normalize:
  const conversationId =
    typeof params?.conversationId === "string"
      ? params.conversationId
      : Array.isArray(params?.conversationId)
      ? params.conversationId[0]
      : "unknown";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      content: "Hi, I’m interested in your services.",
      timestamp: "2025-06-10T10:00:00Z",
    },
    {
      id: "2",
      sender: "vendor",
      content: "Thanks for reaching out! How can I help?",
      timestamp: "2025-06-10T10:01:00Z",
    },
  ]);

  const [newMessage, setNewMessage] = useState<string>("");

  const handleSend = () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    const messageToAdd: Message = {
      id: String(messages.length + 1),
      sender: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageToAdd]);
    setNewMessage("");
  };

  return (
    <main className="flex flex-col p-6 min-h-screen bg-white max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Conversation {conversationId}</h1>
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
              msg.sender === "user" ? "bg-blue-100 self-start" : "bg-gray-200 self-end"
            }`}
            aria-label={`${msg.sender === "user" ? "You" : "Vendor"} said`}
          >
            <p>{msg.content}</p>
            <small className="text-gray-500 text-xs">
              {new Date(msg.timestamp).toLocaleString()}
            </small>
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
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </main>
  );
}
