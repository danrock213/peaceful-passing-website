'use client';

import { useParams } from 'next/navigation';
import { getTributeById } from '@/utils/tributeStorage';
import Image from 'next/image';

export default function TributeDetailPage() {
  const { id } = useParams();
  const tribute = getTributeById(id as string);

  if (!tribute) return <p className="p-6 text-red-600">Tribute not found.</p>;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{tribute.name}</h1>
      <p className="text-gray-600 mb-4">{tribute.birthDate} - {tribute.deathDate}</p>
      {tribute.imageUrl && (
        <div className="relative w-full h-64 mb-4">
          <Image src={tribute.imageUrl} alt={tribute.name} fill className="object-cover rounded" />
        </div>
      )}
      <p className="whitespace-pre-line text-gray-800">{tribute.story}</p>
    </main>
  );
}
