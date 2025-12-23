/**
 * WordPress REST API Service for ERentals Exclusive
 * Base URL: https://erentalsexclusive.com/wp-json/wp/v2
 */

import {
  RentalAssetRaw,
  Rental,
  TaxonomyTerm,
  RentalListParams,
  PaginatedResponse,
} from '@/types/rental';

const API_BASE = 'https://erentalsexclusive.com/wp-json/wp/v2';

/**
 * Helper to decode HTML entities in titles
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/**
 * Transform raw WordPress rental asset to app-friendly format
 */
function transformRental(raw: RentalAssetRaw): Rental {
  const embedded = raw._embedded;
  const featuredMedia = embedded?.['wp:featuredmedia']?.[0];
  const terms = embedded?.['wp:term'] || [];

  // Find taxonomy terms from embedded data
  const findTerm = (taxonomyIndex: number): TaxonomyTerm | null => {
    const termArray = terms[taxonomyIndex];
    return termArray?.[0] || null;
  };

  return {
    id: raw.id,
    title: raw.title?.rendered ? decodeHtmlEntities(raw.title.rendered) : 'Untitled',
    slug: raw.slug || '',
    link: raw.link || '',
    datePublished: raw.date || '',
    dateModified: raw.modified || '',
    content: raw.content?.rendered || '',
    excerpt: raw.excerpt?.rendered || '',
    featuredImage: featuredMedia
      ? {
          url: featuredMedia.source_url,
          alt: featuredMedia.alt_text || '',
          width: featuredMedia.media_details?.width || 0,
          height: featuredMedia.media_details?.height || 0,
          sizes: {
            thumbnail: featuredMedia.media_details?.sizes?.thumbnail?.source_url,
            medium: featuredMedia.media_details?.sizes?.medium?.source_url,
            large: featuredMedia.media_details?.sizes?.large?.source_url,
            full: featuredMedia.source_url,
          },
        }
      : null,
    // Term order in _embedded: 0=city, 1=country, 2=rental_category, 3=rental_status
    city: findTerm(0),
    country: findTerm(1),
    category: findTerm(2),
    status: findTerm(3),
    acf: raw.acf,
  };
}

/**
 * Fetch rental assets with optional filters
 */
export async function getRentals(
  params: RentalListParams = {}
): Promise<PaginatedResponse<Rental>> {
  const {
    page = 1,
    perPage = 10,
    city,
    country,
    category,
    status,
    search,
    orderBy = 'date',
    order = 'desc',
  } = params;

  const queryParams = new URLSearchParams({
    _embed: 'true',
    page: page.toString(),
    per_page: perPage.toString(),
    orderby: orderBy,
    order: order,
  });

  if (city) queryParams.append('city', city.toString());
  if (country) queryParams.append('country', country.toString());
  if (category) queryParams.append('rental_category', category.toString());
  if (status) queryParams.append('rental_status', status.toString());
  if (search) queryParams.append('search', search);

  const url = `${API_BASE}/rental_asset?${queryParams}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const total = parseInt(response.headers.get('X-WP-Total') || '0', 10);
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

  const rawData: RentalAssetRaw[] = await response.json();
  const data = rawData.map(transformRental);

  return {
    data,
    total,
    totalPages,
    page,
    perPage,
  };
}

/**
 * Fetch a single rental by ID
 */
export async function getRentalById(id: number): Promise<Rental> {
  const response = await fetch(`${API_BASE}/rental_asset/${id}?_embed=true`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const raw: RentalAssetRaw = await response.json();
  return transformRental(raw);
}

/**
 * Fetch a single rental by slug
 */
export async function getRentalBySlug(slug: string): Promise<Rental | null> {
  const response = await fetch(
    `${API_BASE}/rental_asset?slug=${slug}&_embed=true`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const rawData: RentalAssetRaw[] = await response.json();
  if (rawData.length === 0) return null;

  return transformRental(rawData[0]);
}

/**
 * Fetch all cities
 */
export async function getCities(): Promise<TaxonomyTerm[]> {
  const response = await fetch(`${API_BASE}/city?per_page=100`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all countries
 */
export async function getCountries(): Promise<TaxonomyTerm[]> {
  const response = await fetch(`${API_BASE}/country?per_page=100`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all rental categories
 */
export async function getRentalCategories(): Promise<TaxonomyTerm[]> {
  const response = await fetch(`${API_BASE}/rental_category?per_page=100`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search rentals by keyword
 */
export async function searchRentals(
  query: string,
  params: Omit<RentalListParams, 'search'> = {}
): Promise<PaginatedResponse<Rental>> {
  return getRentals({ ...params, search: query });
}
