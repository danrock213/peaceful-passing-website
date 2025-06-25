export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Review {
  id: string;
  vendor_id: string; // Needed for Supabase table relationships
  author: string;
  rating: number; // 1 to 5 stars
  comment: string;
  date: string; // ISO 8601 timestamp
}

export interface Vendor {
  id: string;
  name: string;
  category: string; // category ID (foreign key)
  location: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  email?: string;
  imageUrl?: string;
  images?: string[]; // File upload URLs (preferably from Supabase storage)
  description?: string;
  hours?: string;
  services?: string[];
  social?: {
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  approved?: boolean;
  updatedAt?: string;
}

export interface VendorProfile {
  vendorId: string;
  businessName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  categories?: string[]; // category IDs
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  services?: string[];
  availability?: string;
  gallery?: string[]; // URLs to images
}
