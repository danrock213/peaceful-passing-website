'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import VendorLocationForm from '@/components/VendorLocationForm';

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

  // ⛔ Redirect if not signed in or not a vendor
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.unsafeMetadata?.role !== 'vendor') {
        alert('Only vendors can add vendor profiles.');
        router.push('/');
      }
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
    if (!form.name.trim()) {
      setError('Name is required.');
      return false;
    }
    if (!form.location.trim()) {
      setError('Location is required.');
      return false;
    }
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
      ...form,
      created_by: user.id, // ✅ user.id is Clerk ID as text
      approved: false,
    });

    setSaving(false);

    if (supabaseError) {
      setError(supabaseError.message);
      return;
    }

    alert('Vendor submitted! Awaiting admin approval.');
    router.push('/vendors/pending');
  };

  if (!isLoaded) {
    return (
      <main className="max-w-xl mx-auto p-6 text-center">
        <p>Loading user data...</p>
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
        {/* Name, Phone, Website */}
        {['name', 'phone', 'website'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-sm font-medium">
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

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium">
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

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
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

        {/* Location */}
        <VendorLocationForm
          initialLocation={form.location}
          onSave={handleLocationSave}
        />

        {/* Approved (disabled for vendors) */}
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
            <span className="text-sm opacity-50">Approved (admin only)</span>
          </label>
        </div>

        {/* Submit */}
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
