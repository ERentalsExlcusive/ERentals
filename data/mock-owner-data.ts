/**
 * Mock data for Owner Portal V1
 * This will be replaced with Supabase data in production
 */

export interface OwnerAsset {
  id: number;
  name: string;
  slug: string;
  category: 'villa' | 'yacht' | 'transport';
  location: string;
  imageUrl: string;
  status: 'active' | 'draft' | 'unavailable';
  stats: {
    views: number;
    inquiries: number;
    bookings: number;
  };
  displayPrice: string;
}

export interface OwnerInquiry {
  id: number;
  date: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyName: string;
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  stage: 'new' | 'contacted' | 'options_sent' | 'negotiating' | 'confirmed' | 'lost';
  notes?: string;
}

export interface OwnerStats {
  totalAssets: number;
  totalInquiries: number;
  totalBookings: number;
  revenue: string;
}

// Mock assets data
export const MOCK_ASSETS: OwnerAsset[] = [
  {
    id: 1,
    name: 'Casa Azul Tulum',
    slug: 'casa-azul-tulum',
    category: 'villa',
    location: 'Tulum, Mexico',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    status: 'active',
    stats: { views: 1247, inquiries: 23, bookings: 8 },
    displayPrice: 'From $850 USD per night',
  },
  {
    id: 2,
    name: 'Villa Mykonos Blue',
    slug: 'villa-mykonos-blue',
    category: 'villa',
    location: 'Mykonos, Greece',
    imageUrl: 'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=600&q=80',
    status: 'active',
    stats: { views: 892, inquiries: 15, bookings: 5 },
    displayPrice: 'From $1,200 USD per night',
  },
  {
    id: 3,
    name: 'Sunset Yacht Charter',
    slug: 'sunset-yacht-charter',
    category: 'yacht',
    location: 'Miami, USA',
    imageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&q=80',
    status: 'active',
    stats: { views: 654, inquiries: 12, bookings: 4 },
    displayPrice: 'From $5,000 USD per day',
  },
  {
    id: 4,
    name: 'Monaco Penthouse',
    slug: 'monaco-penthouse',
    category: 'villa',
    location: 'Monaco',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    status: 'draft',
    stats: { views: 0, inquiries: 0, bookings: 0 },
    displayPrice: 'From $3,500 USD per night',
  },
  {
    id: 5,
    name: 'Luxury Van Service',
    slug: 'luxury-van-service',
    category: 'transport',
    location: 'Cancun, Mexico',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    status: 'active',
    stats: { views: 432, inquiries: 28, bookings: 15 },
    displayPrice: 'From $250 USD per transfer',
  },
];

// Mock inquiries data
export const MOCK_INQUIRIES: OwnerInquiry[] = [
  {
    id: 1,
    date: '2026-01-02',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    guestPhone: '+1 555-123-4567',
    propertyName: 'Casa Azul Tulum',
    propertyId: 1,
    checkIn: '2026-02-15',
    checkOut: '2026-02-22',
    guests: 6,
    message: 'We are celebrating a 40th birthday. Would love to know about chef services.',
    stage: 'new',
  },
  {
    id: 2,
    date: '2026-01-01',
    guestName: 'Michael Chen',
    guestEmail: 'mchen@business.com',
    guestPhone: '+1 555-987-6543',
    propertyName: 'Villa Mykonos Blue',
    propertyId: 2,
    checkIn: '2026-06-10',
    checkOut: '2026-06-17',
    guests: 8,
    stage: 'contacted',
    notes: 'Sent availability and pricing details',
  },
  {
    id: 3,
    date: '2025-12-30',
    guestName: 'Emma Williams',
    guestEmail: 'emma.w@gmail.com',
    guestPhone: '+44 7700 900123',
    propertyName: 'Sunset Yacht Charter',
    propertyId: 3,
    checkIn: '2026-03-20',
    checkOut: '2026-03-20',
    guests: 10,
    message: 'Corporate team building event',
    stage: 'options_sent',
    notes: 'Sent 3 package options with catering',
  },
  {
    id: 4,
    date: '2025-12-28',
    guestName: 'James Rodriguez',
    guestEmail: 'jrodriguez@company.com',
    guestPhone: '+1 555-456-7890',
    propertyName: 'Casa Azul Tulum',
    propertyId: 1,
    checkIn: '2026-04-01',
    checkOut: '2026-04-08',
    guests: 4,
    stage: 'negotiating',
    notes: 'Negotiating extended stay discount',
  },
  {
    id: 5,
    date: '2025-12-25',
    guestName: 'Sophie Martin',
    guestEmail: 'sophie.m@outlook.com',
    guestPhone: '+33 6 12 34 56 78',
    propertyName: 'Villa Mykonos Blue',
    propertyId: 2,
    checkIn: '2026-07-15',
    checkOut: '2026-07-25',
    guests: 6,
    stage: 'confirmed',
    notes: 'Deposit received. Full payment due 30 days before.',
  },
  {
    id: 6,
    date: '2025-12-20',
    guestName: 'David Kim',
    guestEmail: 'dkim@email.com',
    guestPhone: '+82 10-1234-5678',
    propertyName: 'Luxury Van Service',
    propertyId: 5,
    checkIn: '2026-01-10',
    checkOut: '2026-01-10',
    guests: 4,
    stage: 'confirmed',
    notes: 'Airport pickup confirmed',
  },
  {
    id: 7,
    date: '2025-12-18',
    guestName: 'Lisa Thompson',
    guestEmail: 'lisa.t@mail.com',
    guestPhone: '+1 555-222-3333',
    propertyName: 'Casa Azul Tulum',
    propertyId: 1,
    checkIn: '2026-01-20',
    checkOut: '2026-01-25',
    guests: 2,
    stage: 'lost',
    notes: 'Booked another property',
  },
  {
    id: 8,
    date: '2026-01-03',
    guestName: 'Robert Taylor',
    guestEmail: 'rtaylor@business.net',
    guestPhone: '+1 555-888-9999',
    propertyName: 'Sunset Yacht Charter',
    propertyId: 3,
    checkIn: '2026-02-14',
    checkOut: '2026-02-14',
    guests: 8,
    message: 'Valentine\'s Day sunset cruise for my wife',
    stage: 'new',
  },
];

// Mock owner stats
export const MOCK_STATS: OwnerStats = {
  totalAssets: 5,
  totalInquiries: 78,
  totalBookings: 32,
  revenue: '$45,600',
};

// Helper functions
export function getAssetById(id: number): OwnerAsset | undefined {
  return MOCK_ASSETS.find(asset => asset.id === id);
}

export function getInquiriesByAsset(assetId: number): OwnerInquiry[] {
  return MOCK_INQUIRIES.filter(inquiry => inquiry.propertyId === assetId);
}

export function getInquiriesByStage(stage: OwnerInquiry['stage']): OwnerInquiry[] {
  return MOCK_INQUIRIES.filter(inquiry => inquiry.stage === stage);
}

export function getRecentInquiries(limit: number = 5): OwnerInquiry[] {
  return [...MOCK_INQUIRIES]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Stage configuration for UI
export const INQUIRY_STAGES = {
  new: { label: 'New', color: '#3b82f6' },
  contacted: { label: 'Contacted', color: '#eab308' },
  options_sent: { label: 'Options Sent', color: '#8b5cf6' },
  negotiating: { label: 'Negotiating', color: '#f97316' },
  confirmed: { label: 'Confirmed', color: '#22c55e' },
  lost: { label: 'Lost', color: '#6b7280' },
};
