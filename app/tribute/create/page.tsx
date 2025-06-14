'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tribute } from '@/types/tribute';
import { getTributes, saveTributes } from '@/utils/tributeStorage';

export default function CreateTributePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const isSignedIn = true; // Replace this
  const userName = 'DemoUser'; // Replace this

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newTribute: Tribute = {
      id: Date.now().toString(),
      name,
      birthDate,
      deathDate,
      story,
      imageUrl,
      createdBy: userName,
    };

    const updatedTributes = [newTribute, ...getTributes()];
    saveTributes(updatedTributes);

    router.push(`/tribute/${newTribute.id}`);
  }

  if (!isSignedIn) {
    router.push('/sign-in');
    return null;
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Tribute Page</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full p-2 border rounded" />
        <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className="w-full p-2 border rounded" />
        <textarea value={story} onChange={(e) => setStory(e.target.value)} placeholder="Life story..." className="w-full p-2 border rounded" rows={4} />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className="w-full p-2 border rounded" />
        <button type="submit" className="bg-[#1D3557] text-white px-4 py-2 rounded">Create Tribute</button>
      </form>
    </main>
  );
}
