export type VendorStatus = 'pending' | 'approved' | 'rejected';

export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Review {
  id: string;
  vendor_id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export type SenderType = 'user' | 'vendor' | 'admin';

export interface Message {
  id: string;
  vendor_id: string;
  sender: string;
  sender_type: SenderType;
  content: string;
  date: string;
  read: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  status: VendorStatus; // ✅ ADDED TO FIX BUILD
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  hours?: string;
  services?: string[];
  social?: {
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  reviews?: Review[];
  approved?: boolean;
  updatedAt?: string;
}

export interface VendorProfile {
  vendorId: string;
  businessName: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  categories: string[];
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
