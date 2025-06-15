'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createTribute } from '@/utils/tributeStorage';
import { Tribute } from '@/types/tribute';

export default function CreateTributePage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [tribute, setTribute] = useState<Tribute>({
    id: '',
    name: '',
    birthDate: '',
    deathDate: '',
    story: '',
  });

  useEffect(() => {
    // Once the user state is loaded, redirect if not signed in
    if (isLoaded && !isSignedIn) {
      router.replace('/sign-in?redirect_url=/tribute/create');
    }
  }, [isLoaded, isSignedIn, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTribute({ ...tribute, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createTribute(tribute);
    router.push('/tribute');
  }

  // Optional: Show loading while user state is being checked
  if (!isLoaded) {
    return <p className="text-center text-gray-500 mt-10">Loading...</p>;
  }

  // While redirecting, you could optionally show nothing or a spinner
  if (!isSignedIn) return null;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#1D3557] mb-6">Create Tribute</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          value={tribute.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="birthDate"
          placeholder="Birth date"
          value={tribute.birthDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="deathDate"
          placeholder="Death date"
          value={tribute.deathDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="story"
          placeholder="Share their story..."
          value={tribute.story}
          onChange={handleChange}
          className="w-full border p-2 rounded h-40"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[#1D3557] text-white rounded hover:bg-[#F4A261] hover:text-[#1D3557] transition"
        >
          Save Tribute
        </button>
      </form>
    </main>
  );
}
