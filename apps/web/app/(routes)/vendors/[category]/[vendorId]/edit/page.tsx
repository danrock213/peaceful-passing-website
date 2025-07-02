'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Vendor {
  id: string;
  name: string;
  category: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  services?: string[];
  social?: {
    facebook?: string;
    instagram?: string;
  };
  created_by: string;
}

interface VendorImage {
  id: string;
  vendor_id: string;
  image_url: string;
}

export default function VendorEditPage() {
  const supabase = createClientComponentClient();
  const params = useParams() as { category?: string; vendorId?: string };
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [images, setImages] = useState<(string | File)[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [hours, setHours] = useState('');
  const [services, setServices] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  // For cleanup of object URLs on unmount
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Auth & role check
  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.unsafeMetadata?.role !== 'vendor') {
        alert('Only vendors can edit vendor profiles.');
        router.push('/');
      }
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    async function fetchVendorAndImages() {
      if (!params.vendorId) return;
      setLoading(true);

      // Fetch vendor
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', params.vendorId)
        .single<Vendor>();

      if (vendorError || !vendorData) {
        setError(vendorError?.message || 'Vendor not found.');
        setLoading(false);
        return;
      }

      // Authorization check
      if (vendorData.created_by !== user?.id) {
        setError('You are not authorized to edit this vendor.');
        setLoading(false);
        return;
      }

      // Fetch images from vendor_images table
      const { data: imageData, error: imageError } = await supabase
        .from('vendor_images')
        .select('id, vendor_id, image_url')
        .eq('vendor_id', params.vendorId);

      if (imageError) {
        console.error('Error fetching vendor images:', imageError.message);
      }

      setVendor(vendorData);

      // Initialize form fields
      setDescription(vendorData.description ?? '');
      setPhone(vendorData.phone ?? '');
      setEmail(vendorData.email ?? '');
      setWebsite(vendorData.website ?? '');
      setHours(vendorData.hours ?? '');
      setServices((vendorData.services ?? []).join(', '));
      setFacebook(vendorData.social?.facebook ?? '');
      setInstagram(vendorData.social?.instagram ?? '');

      // Set images URLs from vendor_images plus any existing images array (fallback)
      setImages(imageData?.map((img) => img.image_url) ?? []);

      setLoading(false);
    }

    if (isLoaded && user) {
      fetchVendorAndImages();
    }
  }, [params.vendorId, supabase, user, isLoaded]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    // Create object URLs for preview and keep track to revoke later
    filesArray.forEach((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
    });

    setImages((prev) => [...prev, ...filesArray]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (typeof removed !== 'string') {
        // Revoke object URL for files when removed
        const urlIdx = objectUrls.current.findIndex((url) => url === URL.createObjectURL(removed));
        if (urlIdx !== -1) objectUrls.current.splice(urlIdx, 1);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!vendor) {
      setError('Vendor data not loaded.');
      setSaving(false);
      return;
    }

    try {
      // Upload new image files to Supabase Storage
      const newFiles = images.filter((img): img is File => img instanceof File);
      const uploadedUrls: string[] = [];

      for (const file of newFiles) {
        const filePath = `vendor-images/${vendor.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('vendor-images')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          throw new Error(`Failed to upload image ${file.name}: ${uploadError.message}`);
        }

        // Fix here: getPublicUrl returns { data: { publicUrl } } with no error field
        const { data } = supabase.storage
          .from('vendor-images')
          .getPublicUrl(filePath);

        if (!data?.publicUrl) {
          throw new Error(`Failed to get public URL for image ${file.name}`);
        }

        const publicUrl = data.publicUrl;

        // Save to vendor_images table
        const { error: dbError } = await supabase
          .from('vendor_images')
          .insert({ vendor_id: vendor.id, image_url: publicUrl });

        if (dbError) {
          throw new Error(`Failed to save image URL to database: ${dbError.message}`);
        }

        uploadedUrls.push(publicUrl);
      }

      // Combine existing URLs and newly uploaded URLs
      const existingUrls = images.filter((img): img is string => typeof img === 'string');
      const allImageUrls = [...existingUrls, ...uploadedUrls];

      // Update vendor profile
      const { error: updateError } = await supabase
        .from('vendors')
        .update({
          description,
          phone,
          email,
          website,
          hours,
          services: services.split(',').map((s) => s.trim()).filter(Boolean),
          social: { facebook, instagram },
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      alert('Vendor updated successfully!');
      router.push(`/vendors/${vendor.category}/${vendor.id}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6">Loading vendor data...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!vendor) return null;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Vendor Profile: {vendor.name}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ...rest of your form UI as is... */}
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
            disabled={saving}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <img
                  src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                  alt={`Uploaded ${idx}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 text-white bg-red-600 px-1 rounded"
                  disabled={saving}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>
    </main>
  );
}
