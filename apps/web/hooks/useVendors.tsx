import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface Vendor {
  id: string;
  name: string;
  category: string;
  approved: boolean;
  // add other fields as needed
}

export function useVendors() {
  const supabase = createClientComponentClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*');
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setVendors(data ?? []);
      setLoading(false);
    }
    fetchVendors();
  }, []);

  async function updateVendorApproval(id: string, approved: boolean) {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .update({ approved })
      .eq('id', id);
    if (error) {
      setError(error.message);
      setLoading(false);
      alert('Failed to update vendor: ' + error.message);
      return;
    }
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, approved } : v))
    );
    setLoading(false);
  }

  return { vendors, loading, error, updateVendorApproval };
}
