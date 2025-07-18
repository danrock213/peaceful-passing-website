'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function VendorNewPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const supabase = createBrowserClient();

  const [form, setForm] = useState({ name: '', category: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const hasSetRole = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || hasSetRole.current) return;

    const updateRole = async () => {
      try {
        await user.update({ unsafeMetadata: { role: 'vendor' } } as any);
        hasSetRole.current = true;
      } catch (err) {
        console.error('❌ Failed to update role:', err);
      }
    };

    updateRole();
  }, [isLoaded, isSignedIn, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            created_by: user.id, // This should match the `auth.jwt().sub` RLS
            name: form.name,
            category: form.category,
            location: form.location,
            approved: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        alert(`There was a problem creating your vendor listing.\n\n${error.message}`);
        return;
      }

      console.log('✅ Created vendor:', data);
      router.push('/vendor/dashboard');
    } catch (err) {
      console.error('❌ Unexpected error during insert:', err);
      alert('Unexpected error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Create Your Vendor Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Business Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          name="category"
          placeholder="Category (e.g., Catering, Floral)"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
