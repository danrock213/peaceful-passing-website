// /data/vendors.ts

export interface Vendor {
  id: string;
  name: string;
  category: string;
  location: string;
  lat?: number;  // <-- added
  lng?: number;  // <-- added
  description: string;
  imageUrl: string;
}

export const vendors: Vendor[] = [
  {
    id: '1',
    name: 'Tarrytown Funeral Home',
    category: 'funeral-homes',
    location: 'Tarrytown, NY',
    lat: 41.0762,
    lng: -73.8587,
    description: 'Providing compassionate funeral services in Tarrytown.',
    imageUrl: '/images/vendors/funeral-home-1.jpg',
  },
  {
    id: '2',
    name: 'NYC Florists',
    category: 'florists',
    location: 'New York City, NY',
    lat: 40.7128,
    lng: -74.006,
    description: 'Fresh flowers for every occasion.',
    imageUrl: '/images/vendors/florist-1.jpg',
  },
  {
    id: 'test-001',
    category: 'funeral-homes',
    name: 'Sample Funeral Home',
    location: 'Tarrytown, NY',
    description: 'A trusted funeral home serving the Tarrytown community.',
    imageUrl: '/sample-funeral-home.jpg', // place a sample image in /public folder or use a URL
    contactEmail: 'contact@samplefuneralhome.com',
    website: 'https://samplefuneralhome.com',
    lat: 41.0763,
    lng: -73.8616,
  }, // ...add more vendors
];
