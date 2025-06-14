'use client';

import Link from 'next/link';
import { getTributes } from '@/utils/tributeStorage';
import { useEffect, useState } from 'react';
import { Tribute } from '@/types/tribute';

export default function TributeListPage() {
  const [tributes, setTributes] = useState<Tribute[]>([]);

  useEffect(() => {
    setTributes(getTributes());
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tribute Pages</h1>
      <Link href="/tribute/create" className="text-blue-600 underline mb-4 block">+ Create New Tribute</Link>
      <ul className="space-y-4">
        {tributes.length === 0 && <p>No tributes created yet.</p>}
        {tributes.map((t) => (
          <li key={t.id} className="border p-4 rounded bg-gray-50 hover:bg-gray-100 transition">
            <Link href={`/tribute/${t.id}`}>
              <p className="text-xl font-semibold text-[#1D3557]">{t.name}</p>
              <p className="text-gray-600 text-sm">{t.birthDate} - {t.deathDate}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
