// File: app/tribute/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { Tribute } from "../page";

export default function TributeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [tribute, setTribute] = useState<Tribute | null>(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("tributes") || "[]");
    const found = stored.find((t: Tribute) => t.id === id);
    if (!found) router.push("/tribute");
    else setTribute(found);
  }, [id]);

  if (!tribute) return null;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-[#1D3557]">{tribute.name}</h1>
      <p className="text-gray-500 text-sm">
        {tribute.birthDate} – {tribute.deathDate}
      </p>
      <p className="mt-4 whitespace-pre-line text-gray-800">{tribute.obituary}</p>
      {user?.id === tribute.creatorId && (
        <Link
          href={`/tribute/${tribute.id}/edit`}
          className="inline-block mt-6 text-sm text-[#1D3557] hover:underline"
        >
          Edit Tribute
        </Link>
      )}
    </div>
  );
}
