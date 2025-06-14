import { Vendor, VendorCategory } from '@/types/vendor';

export interface VendorCategory {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  imageUrl?: string;
  description?: string;
}

// Vendor categories with images from /images/categories
export const vendorCategories: VendorCategory[] = [
  {
    id: 'funeral-homes',
    name: 'Funeral Homes',
    imageUrl: '/images/categories/funeral-home.png',
    description: 'Compassionate funeral homes to guide your arrangements.',
  },
  {
    id: 'crematoriums',
    name: 'Crematoriums',
    imageUrl: '/images/categories/crematorium.png',
    description: 'Trusted crematorium services for respectful care.',
  },
  {
    id: 'florists',
    name: 'Florists',
    imageUrl: '/images/categories/florist.png',
    description: 'Beautiful floral arrangements for every tribute.',
  },
  {
    id: 'grief-counselors',
    name: 'Grief Counselors',
    imageUrl: '/images/categories/grief-counselor.png',
    description: 'Professional support during difficult times.',
  },
  {
    id: 'estate-lawyers',
    name: 'Estate Lawyers',
    imageUrl: '/images/categories/estate-lawyer.png',
    description: 'Legal assistance with estate and will planning.',
  },
  {
    id: 'memorial-products',
    name: 'Memorial Products',
    imageUrl: '/images/categories/memorial-product.png',
    description: 'Custom memorial keepsakes and products.',
  },
  {
    id: 'event-venues',
    name: 'Event Venues',
    imageUrl: '/images/categories/event-venue.png',
    description: 'Beautiful venues for memorial services and gatherings.',
  },
];

// Sample vendors with images from /images/vendors
export const vendors: Vendor[] = [
  {
    id: 'sunset-funeral-home',
    name: 'Sunset Funeral Home',
    category: 'funeral-homes',
    location: 'New York, NY',
    lat: 40.7128,
    lng: -74.006,
    phone: '212-555-1234',
    website: 'https://sunsetfuneralhome.com',
    imageUrl: '/images/vendors/sunset-funeral-home.png',
    description: 'Providing compassionate funeral services in New York.',
  },
  {
    id: 'green-park-crematorium',
    name: 'Green Park Crematorium',
    category: 'crematoriums',
    location: 'Brooklyn, NY',
    lat: 40.6782,
    lng: -73.9442,
    phone: '718-555-5678',
    website: 'https://greenparkcrematorium.com',
    imageUrl: '/images/vendors/green-park-crematorium.png',
    description: 'Trusted cremation services in Brooklyn area.',
  },
  {
    id: 'bloom-florist',
    name: 'Bloom Florist',
    category: 'florists',
    location: 'Queens, NY',
    lat: 40.7282,
    lng: -73.7949,
    phone: '718-555-9012',
    website: 'https://bloomflorist.com',
    imageUrl: '/images/vendors/bloom-florist.png',
    description: 'Fresh flower arrangements for every occasion.',
  },
  // add more vendors as needed
];
