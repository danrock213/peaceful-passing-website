'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function RoleSwitcherPage() {
  const { user } = useUser();
  const [newRole, setNewRole] = useState('');

  const updateRole = async () => {
    if (!user) return;

    await fetch('/api/set-role', {
      method: 'POST',
      body: JSON.stringify({ role: newRole }),
    });

    window.location.reload(); // Refresh UI after role update
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h1 className="text-2xl font-bold mb-4">Set Your Role</h1>

      <p className="mb-2">Current Role: <strong>{user?.publicMetadata?.role || 'Not set'}</strong></p>

      <input
        type="text"
        placeholder="Enter role: user / vendor / admin"
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        className="border border-gray-300 p-2 w-full rounded mb-4"
      />

      <button
        onClick={updateRole}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Role
      </button>
    </div>
  );
}
