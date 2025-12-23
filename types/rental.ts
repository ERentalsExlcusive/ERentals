/**
 * WordPress REST API Types for ERentals Exclusive
 */

// Taxonomy term (city, country, rental_category, rental_status)
export interface TaxonomyTerm {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
  link?: string;
}

// WordPress media sizes
export interface MediaSize {
  file: string;
  width: number;
  height: number;
  mime_type: string;
  source_url: string;
}

export interface MediaSizes {
  thumbnail?: MediaSize;
  medium?: MediaSize;
  medium_large?: MediaSize;
  large?: MediaSize;
  full?: MediaSize;
  '1536x1536'?: MediaSize;
  '2048x2048'?: MediaSize;
}

// Featured media from _embedded
export interface FeaturedMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: MediaSizes;
  };
}

// Rental Asset from WordPress API
export interface RentalAssetRaw {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  featured_media: number;
  city: number[];
  country: number[];
  rental_category: number[];
  rental_status: number[];
  acf?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: FeaturedMedia[];
    'wp:term'?: TaxonomyTerm[][];
  };
}

// Processed rental for app use
export interface Rental {
  id: number;
  title: string;
  slug: string;
  link: string;
  datePublished: string;
  dateModified: string;
  content: string;
  excerpt: string;
  featuredImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
    sizes: {
      thumbnail?: string;
      medium?: string;
      large?: string;
      full?: string;
    };
  } | null;
  city: TaxonomyTerm | null;
  country: TaxonomyTerm | null;
  category: TaxonomyTerm | null;
  status: TaxonomyTerm | null;
  acf?: Record<string, unknown>;
}

// API response types
export interface RentalListParams {
  page?: number;
  perPage?: number;
  city?: number;
  country?: number;
  category?: number;
  status?: number;
  search?: string;
  orderBy?: 'date' | 'title' | 'modified';
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
}

// Rental categories enum for convenience
export enum RentalCategory {
  Villa = 44,
  Yacht = 45,
  Transport = 84,
  Property = 99,
  Hotel = 102,
}

// Countries enum for convenience
export enum Country {
  Colombia = 111,
  CostaRica = 129,
  France = 119,
  Greece = 133,
  Mexico = 100,
  Turkey = 116,
  USA = 117,
}
