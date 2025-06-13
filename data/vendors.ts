export const vendorCategories = [
  {
    id: 'funeral-homes',
    name: 'Funeral Homes',
    description: 'Trusted funeral service providers for every need.',
    imageUrl: '/images/vendors/funeral-home.jpg',
  },
  {
    id: 'crematoriums',
    name: 'Crematoriums',
    description: 'Compassionate cremation services.',
    imageUrl: '/images/vendors/crematorium.jpg',
  },
  {
    id: 'florists',
    name: 'Florists',
    description: 'Beautiful floral arrangements for ceremonies and memorials.',
    imageUrl: '/images/vendors/florist.jpg',
  },
  {
    id: 'grief-counselors',
    name: 'Grief Counselors',
    description: 'Supportive professionals for emotional healing.',
    imageUrl: '/images/vendors/grief-counselor.jpg',
  },
  {
    id: 'estate-lawyers',
    name: 'Estate Lawyers',
    description: 'Legal guidance for wills, estates, and probate.',
    imageUrl: '/images/vendors/estate-lawyer.jpg',
  },
  {
    id: 'memorial-products',
    name: 'Memorial Product Providers',
    description: 'Keepsakes and urns to remember loved ones.',
    imageUrl: '/images/vendors/memorial-product.jpg',
  },
  {
    id: 'event-venues',
    name: 'Event Venues',
    description: 'Spaces for memorials and remembrance ceremonies.',
    imageUrl: '/images/vendors/event-venue.jpg',
  },
];

export const vendors = [
  {
    id: 'peaceful-goodbyes-funeral-home',
    name: 'Peaceful Goodbyes Funeral Home',
    category: 'funeral-homes',
    description:
      'Providing compassionate funeral services for families for over 50 years. We offer both traditional and modern services, grief support, and pre-planning assistance.',
    location: 'Brooklyn, NY',
    lat: 40.6782,
    lng: -73.9442,
    phone: '718-555-1234',
    email: 'contact@peacefulgoodbyes.com',
    website: 'https://peacefulgoodbyes.com',
    imageUrl: '/images/vendors/funeral-home.jpg',
    images: [
      '/images/vendors/funeral-home.jpg',
      '/images/vendors/funeral-home-inside.jpg',
      '/images/vendors/funeral-home-service.jpg',
    ],
    reviews: [
      {
        author: 'Jane Doe',
        rating: 4.5,
        text: 'Caring and respectful throughout. Would recommend to others.',
        date: '2024-12-01',
      },
      {
        author: 'Mark Smith',
        rating: 5,
        text: 'Made a difficult time much easier for our family.',
        date: '2025-01-15',
      },
    ],
  },
  {
    id: 'serenity-flowers',
    name: 'Serenity Flowers',
    category: 'florists',
    description:
      'Elegant and custom floral arrangements for memorials and ceremonies. We deliver to funeral homes and venues across NYC.',
    location: 'Manhattan, NY',
    lat: 40.7831,
    lng: -73.9712,
    phone: '212-555-9876',
    email: 'info@serenityflowers.com',
    website: 'https://serenityflowers.com',
    imageUrl: '/images/vendors/florist.jpg',
    images: [
      '/images/vendors/florist.jpg',
      '/images/vendors/florist-bouquet.jpg',
      '/images/vendors/florist-storefront.jpg',
    ],
    reviews: [
      {
        author: 'Laura Nguyen',
        rating: 4.8,
        text: 'Absolutely stunning arrangements. Timely and professional.',
        date: '2025-03-03',
      },
    ],
  },
  {
    id: 'safe-hands-cremation',
    name: 'Safe Hands Cremation Services',
    category: 'crematoriums',
    description:
      'Affordable and respectful cremation with full transparency. Includes pickup and delivery of remains within NYC area.',
    location: 'Queens, NY',
    lat: 40.7282,
    lng: -73.7949,
    phone: '347-555-4545',
    email: 'support@safehands.com',
    website: 'https://safehandscremation.com',
    imageUrl: '/images/vendors/crematorium.jpg',
    images: [
      '/images/vendors/crematorium.jpg',
      '/images/vendors/crematorium-lobby.jpg',
    ],
    reviews: [],
  },
  {
    id: 'everkind-support',
    name: 'Everkind Grief Counseling',
    category: 'grief-counselors',
    description:
      'Licensed grief counselors offering one-on-one and group sessions. Available in-person and virtually.',
    location: 'Tarrytown, NY',
    lat: 41.0762,
    lng: -73.8585,
    phone: '914-555-1010',
    email: 'help@everkind.org',
    website: 'https://everkind.org',
    imageUrl: '/images/vendors/grief-counselor.jpg',
    images: [
      '/images/vendors/grief-counselor.jpg',
      '/images/vendors/grief-counseling-room.jpg',
    ],
    reviews: [
      {
        author: 'James Rivera',
        rating: 4.2,
        text: 'Felt heard and supported during an impossible time.',
        date: '2025-02-10',
      },
    ],
  },
  // Add more vendors here for other categories...
];
