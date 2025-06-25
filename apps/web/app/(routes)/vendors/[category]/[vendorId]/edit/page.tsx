'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { vendors } from '@/data/vendors';
import type { Vendor } from '@/types/vendor';

export default function VendorEditPage() {
  const params = useParams() as { category?: string; vendorId?: string };
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    } else if ((user?.publicMetadata as any)?.role !== 'vendor') {
      alert('Only vendors can edit vendor profiles.');
      router.push('/');
    }
  }, [user, isLoaded, router]);

  const category = params.category;
  const vendorId = params.vendorId;

  if (!category || !vendorId) {
    return <p className="p-6 text-red-600">Invalid URL parameters</p>;
  }

  const vendorData: Vendor | undefined = vendors.find(
    (v) => v.category === category && v.id === vendorId
  );

  if (!vendorData) {
    return <p className="p-6 text-red-600">Vendor not found</p>;
  }

  const [description, setDescription] = useState(vendorData.description || '');
  const [phone, setPhone] = useState(vendorData.phone || '');
  const [email, setEmail] = useState(vendorData.email || '');
  const [website, setWebsite] = useState(vendorData.website || '');
  const [hours, setHours] = useState(vendorData.hours || '');
  const [services, setServices] = useState(vendorData.services?.join(', ') || '');
  const [facebook, setFacebook] = useState(vendorData.social?.facebook || '');
  const [instagram, setInstagram] = useState(vendorData.social?.instagram || '');
  const [images, setImages] = useState<(string | File)[]>(vendorData.images || []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setImages((prev) => [...prev, ...filesArray]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const updatedVendor: Partial<Vendor> = {
      description,
      phone,
      email,
      website,
      hours,
      services: services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      social: {
        facebook,
        instagram,
      },
      images: images.map((img) => (typeof img === 'string' ? img : '')), // TODO: Upload File
    };

    console.log('Submitting vendor updates:', updatedVendor);
    alert('Vendor data saved (mock). Implement backend to persist changes.');
    router.push(`/vendors/${category}/${vendorId}`);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Vendor Profile: {vendorData.name}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="description" className="block font-semibold mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block font-semibold mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full border rounded p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-semibold mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block font-semibold mb-1">
            Website
          </label>
          <input
            id="website"
            type="url"
            className="w-full border rounded p-2"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="hours" className="block font-semibold mb-1">
            Business Hours
          </label>
          <input
            id="hours"
            type="text"
            className="w-full border rounded p-2"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="services" className="block font-semibold mb-1">
            Services (comma-separated)
          </label>
          <input
            id="services"
            type="text"
            className="w-full border rounded p-2"
            value={services}
            onChange={(e) => setServices(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="facebook" className="block font-semibold mb-1">
              Facebook
            </label>
            <input
              id="facebook"
              type="url"
              className="w-full border rounded p-2"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block font-semibold mb-1">
              Instagram
            </label>
            <input
              id="instagram"
              type="url"
              className="w-full border rounded p-2"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="images" className="block font-semibold mb-1">
            Upload Images
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img
                  src={
                    typeof img === 'string'
                      ? img
                      : URL.createObjectURL(img)
                  }
                  alt={`Uploaded ${idx}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 text-white bg-red-600 px-1 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </main>
  );
}
