'use client';

import { useState, useEffect } from 'react';
import type { VendorProfile } from '@/types/vendor'; // ✅ Fix: removed duplicate Vendor import

interface Props {
  vendorId: string;
  initialProfile?: VendorProfile | null;
  onSave?: (profile: VendorProfile) => void;
}

export default function VendorProfileForm({ vendorId, initialProfile, onSave }: Props) {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (initialProfile) {
      setBusinessName(initialProfile.businessName || '');
      setDescription(initialProfile.description || '');
      setEmail(initialProfile.email || '');
      setPhone(initialProfile.phone || '');
      setWebsite(initialProfile.website || '');
      setAddress(initialProfile.address || '');
      setCategories(initialProfile.categories || []);
      setLogoUrl(initialProfile.logoUrl || '');
    }
  }, [initialProfile]);

  const allCategories = ['Funeral Home', 'Florist', 'Crematorium', 'Grief Counselor', 'Estate Lawyer', 'Memorial Products', 'Event Venue'];

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName || !email) {
      setStatusMessage('Business Name and Email are required.');
      return;
    }

    const profile: VendorProfile = {
      vendorId,
      businessName,
      description,
      email,
      phone,
      website,
      address,
      categories,
      logoUrl,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSave) onSave(profile);
    setStatusMessage('Profile saved successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-4 border rounded shadow space-y-4">
      {/* form fields unchanged */}
    </form>
  );
}
