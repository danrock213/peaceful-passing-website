'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import VendorLocationForm from '@/components/VendorLocationForm';
import { v4 as uuidv4 } from 'uuid';

const categoryLabels: Record<string, string> = {
  'funeral-homes': 'Funeral Homes',
  crematoriums: 'Crematoriums',
  florists: 'Florists',
  'grief-counselors': 'Grief Counselors',
  'estate-lawyers': 'Estate Lawyers',
  'memorial-products': 'Memorial Product Providers',
  'event-venues': 'Event Venues',
};

export default function AddVendorPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user, isLoaded } = useUser();

  const [form, setForm] = useState({
    name: '',
    category: 'funeral-homes',
    phone: '',
    website: '',
    description: '',
    location: '',
    lat: 0,
    lng: 0,
    approved: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push('/sign-in');
    } else if (user.unsafeMetadata?.role !== 'vendor') {
      router.push('/dashboard');
    } else {
      setShowForm(true);
    }
  }, [user, isLoaded, router]);

  const handleLocationSave = (location: string, lat: number, lng: number) => {
    setForm((f) => ({ ...f, location, lat, lng }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setError(null);
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setForm((f) => ({ ...f, [name]: target.checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.location.trim()) return setError('Location is required.');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!user) {
      setError('You must be signed in.');
      return;
    }

    setSaving(true);

    const { error: supabaseError } = await supabase.from('vendors').insert({
      id: uuidv4(),
      ...form,
      created_by: user.id,
      approved: false,
    });

    setSaving(false);

    if (supabaseError) {
      setError(`Failed to save: ${supabaseError.message}`);
      return;
    }

    router.push('/vendor/dashboard');
  };

  if (!isLoaded || !showForm) {
    return (
      <main className="max-w-xl mx-auto p-6 text-center">
        <p className="text-gray-600">Checking permissions...</p>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Vendor Profile</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {['name', 'phone', 'website'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium mb-1">
              {field[0].toUpperCase() + field.slice(1)}
            </label>
            <input
              id={field}
              name={field}
              type={field === 'phone' ? 'tel' : 'text'}
              required={field === 'name'}
              value={(form as any)[field]}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-[#1D3557]"
            />
          </div>
        ))}

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border p-2 rounded focus:ring-[#1D3557]"
          />
        </div>

        <VendorLocationForm
          initialLocation={form.location}
          onSave={handleLocationSave}
        />

        <div>
          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              name="approved"
              checked={form.approved}
              onChange={handleChange}
              className="form-checkbox"
              disabled
            />
            <span className="text-sm text-gray-500">Approved (admin only)</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#1D3557] text-white px-6 py-2 rounded hover:bg-[#F4A261] transition"
        >
          {saving ? 'Saving…' : 'Save Vendor'}
        </button>
      </form>
    </main>
  );
}
