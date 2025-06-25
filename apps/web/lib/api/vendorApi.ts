import { supabase } from '@/lib/supabaseClient';
import type { Vendor } from '@/types/vendor';

export async function getAllApprovedVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('approved', true);

  if (error) {
    console.error('Failed to fetch all vendors:', error.message);
    throw error;
  }

  return (data as Vendor[]) ?? [];
}

export async function getVendorsByCategory(category: string): Promise<Vendor[]> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('category', category)
    .eq('approved', true);

  if (error) {
    console.error(`Failed to fetch vendors in category ${category}:`, error.message);
    throw error;
  }

  return (data as Vendor[]) ?? [];
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Failed to fetch vendor with ID ${id}:`, error.message);
    return null; // Do not throw, just return null
  }

  return data as Vendor;
}
