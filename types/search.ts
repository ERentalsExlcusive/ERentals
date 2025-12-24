/**
 * Search and Filter Types
 */

export interface SearchParams {
  categories: string[]; // App category IDs: 'homes', 'yachts', 'transport'
  destination?: {
    type: 'city' | 'country';
    id: number;
    name: string;
  };
  dateRange?: {
    checkIn: Date;
    checkOut: Date;
  };
  guests: {
    adults: number;
    children: number;
  };
}

export interface FilterState {
  priceRange?: [number, number];
  amenities?: string[];
  propertyTypes?: number[];
  bedrooms?: number;
  bathrooms?: number;
}

/**
 * Combined search and filter params for API calls
 */
export interface SearchWithFilters extends SearchParams {
  filters?: FilterState;
  page?: number;
  perPage?: number;
  orderBy?: 'date' | 'title' | 'modified';
  order?: 'asc' | 'desc';
}

/**
 * URL search params (for navigation)
 */
export interface SearchURLParams {
  category?: string; // Comma-separated category IDs
  destination?: string; // City or country ID
  checkin?: string; // ISO date string
  checkout?: string; // ISO date string
  adults?: string;
  children?: string;
}
