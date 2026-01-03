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
  const featuredMediaRaw = embedded?.['wp:featuredmedia']?.[0];
  const terms = embedded?.['wp:term'] || [];

  // Check if featured media is valid (not an error response)
  const featuredMedia = featuredMediaRaw &&
    !('code' in featuredMediaRaw) &&
    'source_url' in featuredMediaRaw
    ? featuredMediaRaw
    : null;

  // Find taxonomy terms by taxonomy name (more robust than array index)
  const findTermByTaxonomy = (taxonomyName: string): TaxonomyTerm | null => {
    for (const termGroup of terms) {
      if (termGroup && termGroup.length > 0) {
        const found = termGroup.find((t: any) => t.taxonomy === taxonomyName);
        if (found) return found;
      }
    }
    return null;
  };

  // Fallback to index-based lookup for city/country (they're consistent)
  const findTermByIndex = (index: number): TaxonomyTerm | null => {
    const termArray = terms[index];
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
            medium_large: featuredMedia.media_details?.sizes?.medium_large?.source_url,
            large: featuredMedia.media_details?.sizes?.large?.source_url,
            full: featuredMedia.source_url,
          },
        }
      : null,
    // Use index for city/country (consistent), taxonomy name for category/status (varies)
    city: findTermByIndex(0),
    country: findTermByIndex(1),
    category: findTermByTaxonomy('rental_category'),
    status: findTermByTaxonomy('rental_status'),
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

  // Fetch more results than requested to account for preview filtering
  // This ensures we have enough non-preview listings to display
  const fetchSize = 100;

  const queryParams = new URLSearchParams({
    _embed: 'true',
    per_page: fetchSize.toString(),
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

  const rawData: RentalAssetRaw[] = await response.json();

  // Filter out all preview versions to avoid duplicates
  const allNonPreview = rawData.filter(item => {
    const slug = item.slug.toLowerCase();
    return !slug.includes('preview');
  });

  // Calculate actual totals based on non-preview items
  const actualTotal = allNonPreview.length;
  const actualTotalPages = Math.ceil(actualTotal / perPage);

  // Paginate the filtered results
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedData = allNonPreview.slice(startIndex, endIndex);

  const data = paginatedData.map(transformRental);

  return {
    data,
    total: actualTotal,
    totalPages: actualTotalPages,
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

/**
 * Gallery image type
 */
export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
  sizes: {
    thumbnail?: string;
    medium?: string;
    large?: string;
    full: string;
  };
}

/**
 * Fetch all gallery images for a rental property
 */
export async function getRentalGallery(rentalId: number): Promise<GalleryImage[]> {
  const response = await fetch(`${API_BASE}/media?parent=${rentalId}&per_page=100`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const rawImages: any[] = await response.json();

  return rawImages.map(img => ({
    id: img.id,
    url: img.source_url,
    alt: img.alt_text || '',
    width: img.media_details?.width || 0,
    height: img.media_details?.height || 0,
    sizes: {
      thumbnail: img.media_details?.sizes?.thumbnail?.source_url,
      medium: img.media_details?.sizes?.medium?.source_url,
      large: img.media_details?.sizes?.large?.source_url,
      full: img.source_url,
    },
  }));
}


// ============================================================================
// GoHighLevel Webhook Integration
// ============================================================================

// GHL Webhook URL - Configure this with your actual webhook endpoint
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/ERentalsExclusive/booking';

/**
 * UTM Attribution for lead tracking
 */
export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  er_id?: string;
  creator_id?: string;
}

/**
 * Villa/Property Booking Inquiry Data
 */
export interface BookingInquiryData {
  propertyName: string;
  propertyId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
  attribution?: Attribution;
}

/**
 * Charter Booking Inquiry Data (Yacht/Transport)
 */
export interface CharterInquiryData {
  propertyName: string;
  propertyCategory: 'yacht' | 'transport';
  date: string;
  duration: string;
  departureTime: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  occasion?: string;
  notes?: string;
  source?: string;
  attribution?: Attribution;
}

/**
 * Webhook Response
 */
export interface WebhookResponse {
  success: boolean;
  message?: string;
  leadId?: string;
}

/**
 * Submit a villa/property booking inquiry to GoHighLevel
 */
export async function submitBookingInquiry(data: BookingInquiryData): Promise<WebhookResponse> {
  try {
    const payload = {
      // Contact info
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.phone,

      // Custom fields for GHL
      customField: {
        property_name: data.propertyName,
        property_id: String(data.propertyId),
        check_in: data.checkIn,
        check_out: data.checkOut,
        guests: String(data.guests),
        message: data.message || '',
        booking_type: 'villa',
        source: data.source || 'website',
        submitted_at: new Date().toISOString(),
        // UTM Attribution
        utm_source: data.attribution?.utm_source || '',
        utm_medium: data.attribution?.utm_medium || '',
        utm_campaign: data.attribution?.utm_campaign || '',
        utm_content: data.attribution?.utm_content || '',
        utm_term: data.attribution?.utm_term || '',
        er_id: data.attribution?.er_id || '',
        creator_id: data.attribution?.creator_id || '',
      },

      // Tags for segmentation
      tags: [
        'website-lead',
        'villa-inquiry',
        'booking-request',
        data.attribution?.utm_source ? `source-${data.attribution.utm_source}` : null,
        data.attribution?.creator_id ? `creator-${data.attribution.creator_id}` : null,
      ].filter(Boolean),
    };

    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('GHL webhook error:', response.status, await response.text());
      return { success: false, message: 'Failed to submit inquiry' };
    }

    const result = await response.json().catch(() => ({}));
    return {
      success: true,
      message: 'Inquiry submitted successfully',
      leadId: result.contactId || result.id,
    };
  } catch (error) {
    console.error('GHL webhook error:', error);
    return { success: false, message: 'Network error - please try again' };
  }
}

/**
 * Submit a charter booking inquiry to GoHighLevel (Yacht/Transport)
 */
export async function submitCharterInquiry(data: CharterInquiryData): Promise<WebhookResponse> {
  try {
    const payload = {
      // Contact info
      firstName: data.name.split(' ')[0],
      lastName: data.name.split(' ').slice(1).join(' ') || '',
      email: data.email,
      phone: data.phone,

      // Custom fields for GHL
      customField: {
        property_name: data.propertyName,
        property_category: data.propertyCategory,
        charter_date: data.date,
        charter_duration: data.duration,
        departure_time: data.departureTime,
        guests: String(data.guests),
        occasion: data.occasion || '',
        special_requests: data.notes || '',
        booking_type: data.propertyCategory,
        source: data.source || 'website',
        submitted_at: new Date().toISOString(),
        // UTM Attribution
        utm_source: data.attribution?.utm_source || '',
        utm_medium: data.attribution?.utm_medium || '',
        utm_campaign: data.attribution?.utm_campaign || '',
        utm_content: data.attribution?.utm_content || '',
        utm_term: data.attribution?.utm_term || '',
        er_id: data.attribution?.er_id || '',
        creator_id: data.attribution?.creator_id || '',
      },

      // Tags for segmentation
      tags: [
        'website-lead',
        `${data.propertyCategory}-inquiry`,
        'charter-request',
        data.occasion ? `occasion-${data.occasion}` : null,
        data.attribution?.utm_source ? `source-${data.attribution.utm_source}` : null,
        data.attribution?.creator_id ? `creator-${data.attribution.creator_id}` : null,
      ].filter(Boolean),
    };

    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('GHL webhook error:', response.status, await response.text());
      return { success: false, message: 'Failed to submit inquiry' };
    }

    const result = await response.json().catch(() => ({}));
    return {
      success: true,
      message: 'Charter inquiry submitted successfully',
      leadId: result.contactId || result.id,
    };
  } catch (error) {
    console.error('GHL webhook error:', error);
    return { success: false, message: 'Network error - please try again' };
  }
}
