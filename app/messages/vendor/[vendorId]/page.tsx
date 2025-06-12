"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VendorMessagePage() {
  const params = useParams();
  const { vendorId } = params;

  const [messages, setMessages] = useState<{ from: "user" | "vendor"; text: string }[]>([]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input.trim() }]);
    setInput("");
    // Simulate vendor response for demo
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "vendor", text: "Thanks for reaching out! We'll get back to you soon." }]);
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto flex flex-col">
      <Link href={`/vendors/${vendorId}`} className="text-blue-600 hover:underline mb-4">
        &larr; Back to Vendor Profile
      </Link>

      <h1 className="text-3xl font-bold mb-6">Message Vendor</h1>

      <div className="flex-1 bg-white rounded shadow p-4 mb-4 overflow-y-auto max-h-96">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`my-2 p-3 rounded max-w-[80%] ${
                msg.from === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-800 self-start"
              }`}
              style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start" }}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </main>
  );
}
