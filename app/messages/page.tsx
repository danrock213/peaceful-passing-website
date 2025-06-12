// app/messages/page.tsx

import Link from 'next/link';

export default function UserMessagesPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Messages</h1>

      <p className="text-gray-600 mb-4">
        View all conversations you’ve had with vendors below.
      </p>

      <ul className="space-y-4">
        {/* Placeholder links — not mock data, just proving layout works */}
        <li>
          <Link
            href="/messages/convo-123"
            className="block p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100"
          >
            Vendor: Flowers by Grace (convo-123)
          </Link>
        </li>
        <li>
          <Link
            href="/messages/convo-456"
            className="block p-4 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100"
          >
            Vendor: Peaceful Rides LLC (convo-456)
          </Link>
        </li>
      </ul>
    </main>
  );
}
