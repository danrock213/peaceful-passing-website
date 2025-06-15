'use client';

import Link from 'next/link';
import { getTributes } from '@/lib/tributeStorage';
import { useEffect, useState } from 'react';
import { Tribute } from '@/types/tribute';
import { useUser } from '@clerk/nextjs';

export default function TributeListPage() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const { isSignedIn } = useUser();

  useEffect(() => {
    setTributes(getTributes());
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Tribute Pages</h1>

      {isSignedIn ? (
        <Link
          href="/tribute/create"
          className="inline-block mb-6 px-4 py-2 bg-[#1D3557] text-white rounded hover:bg-[#F4A261] hover:text-[#1D3557] transition"
        >
          + Create New Tribute
        </Link>
      ) : (
        <button
          onClick={() =>
            window.location.href =
              '/sign-in?redirect_url=' + encodeURIComponent('/tribute/create')
          }
          className="inline-block mb-6 px-4 py-2 border border-[#1D3557] text-[#1D3557] rounded hover:bg-[#1D3557] hover:text-white transition"
        >
          Sign in to create a tribute
        </button>
      )}

      {tributes.length === 0 ? (
        <p className="text-gray-500">No tributes created yet.</p>
      ) : (
        <ul className="space-y-4">
          {tributes.map((t) => (
            <li
              key={t.id}
              className="border p-4 rounded bg-gray-50 hover:bg-gray-100 transition"
            >
              <Link href={`/tribute/${t.id}`}>
                <p className="text-xl font-semibold text-[#1D3557]">{t.name}</p>
                <p className="text-gray-600 text-sm">
                  {t.birthDate} – {t.deathDate}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
