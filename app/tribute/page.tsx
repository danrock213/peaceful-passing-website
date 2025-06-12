// File: app/tribute/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";

export interface Tribute {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  obituary: string;
  creatorId: string;
}

export default function TributeListPage() {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("tributes");
    if (stored) setTributes(JSON.parse(stored));
  }, []);

  const filtered = tributes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1D3557]">Tribute Pages</h1>
        <Link
          href="/tribute/create"
          className="bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#F4A261] hover:text-[#1D3557]"
        >
          + New Tribute
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search by name..."
        className="w-full border px-4 py-2 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="space-y-4">
        {filtered.map((t) => (
          <li key={t.id} className="border p-4 rounded shadow bg-white">
            <Link href={`/tribute/${t.id}`} className="text-xl font-semibold text-[#1D3557]">
              {t.name}
            </Link>
            <p className="text-sm text-gray-500">
              {t.birthDate} – {t.deathDate}
            </p>
            <p className="mt-2 text-gray-700 line-clamp-3">{t.obituary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}