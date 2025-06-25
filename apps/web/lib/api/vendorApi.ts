import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Vendor = {
  id: string;
  created_by: string;
  name: string;
  category: string;
  phone?: string;
  website?: string;
  description?: string;
  location?: string;
  lat?: number;
  lng?: number;
  approved: boolean;
  imageUrl?: string;
  // add other fields as needed
};

export async function getAllApprovedVendors() {
  const { data, error } = await supabase
    .from<Vendor>('vendors')
    .select('*')
    .eq('approved', true);

  if (error) throw error;
  return data ?? [];
}

export async function getVendorsByCategory(category: string) {
  const { data, error } = await supabase
    .from<Vendor>('vendors')
    .select('*')
    .eq('category', category)
    .eq('approved', true);

  if (error) throw error;
  return data ?? [];
}

export async function getVendorById(id: string) {
  const { data, error } = await supabase
    .from<Vendor>('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
