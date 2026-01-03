import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PROPERTY_DATA } from '../data/property-data';

// Simple in-memory cache
const cache: Map<string, { data: BlockedRange[]; expires: number }> = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface BlockedRange {
  start: string; // ISO date string
  end: string;   // ISO date string
  summary?: string;
}

interface AvailabilityResponse {
  propertySlug: string;
  blockedRanges: BlockedRange[];
  lastUpdated: string;
  cached: boolean;
}

/**
 * Get iCal URL for a property from the property data (sourced from Google Sheets)
 * Uses fuzzy matching to handle WordPress slug → property-data slug differences
 */
function getICalUrl(slug: string): string | undefined {
  // Normalize slug
  const normalizedSlug = slug
    .replace(/-preview-\d+$/, '')
    .replace(/-preview$/, '')
    .toLowerCase();

  // Try exact match first
  if (PROPERTY_DATA[normalizedSlug]) {
    return PROPERTY_DATA[normalizedSlug].icalUrl;
  }

  // Try fuzzy match (e.g., "niku-house" → "niku-house-mexico")
  const matchingKey = Object.keys(PROPERTY_DATA).find(key =>
    key.startsWith(normalizedSlug + '-') || key === normalizedSlug
  );

  return matchingKey ? PROPERTY_DATA[matchingKey].icalUrl : undefined;
}

/**
 * Parse iCal data and extract blocked date ranges
 */
function parseICalData(icalText: string): BlockedRange[] {
  const blockedRanges: BlockedRange[] = [];

  // Simple iCal parser - look for VEVENT blocks
  const eventRegex = /BEGIN:VEVENT[\s\S]*?END:VEVENT/g;
  const events = icalText.match(eventRegex) || [];

  for (const event of events) {
    // Extract DTSTART
    const startMatch = event.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
    // Extract DTEND
    const endMatch = event.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);
    // Extract SUMMARY
    const summaryMatch = event.match(/SUMMARY:(.+)/);

    if (startMatch && endMatch) {
      const startStr = startMatch[1];
      const endStr = endMatch[1];

      // Parse YYYYMMDD format
      const start = `${startStr.slice(0, 4)}-${startStr.slice(4, 6)}-${startStr.slice(6, 8)}`;
      const end = `${endStr.slice(0, 4)}-${endStr.slice(4, 6)}-${endStr.slice(6, 8)}`;

      blockedRanges.push({
        start,
        end,
        summary: summaryMatch ? summaryMatch[1].trim() : undefined,
      });
    }
  }

  return blockedRanges;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Property slug is required' });
  }

  // Look up iCal URL from property data (from Google Sheets)
  const icalUrl = getICalUrl(slug);

  if (!icalUrl) {
    // Property exists but no iCal - return empty (all dates available)
    return res.status(200).json({
      propertySlug: slug,
      blockedRanges: [],
      lastUpdated: new Date().toISOString(),
      cached: false,
      message: 'No availability calendar configured for this property',
    });
  }

  // Check cache
  const cached = cache.get(slug);
  if (cached && cached.expires > Date.now()) {
    return res.status(200).json({
      propertySlug: slug,
      blockedRanges: cached.data,
      lastUpdated: new Date(cached.expires - CACHE_TTL).toISOString(),
      cached: true,
    } as AvailabilityResponse);
  }

  try {
    // Fetch iCal data
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'ERentals-Availability-Checker/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch iCal: ${response.status}`);
    }

    const icalText = await response.text();
    const blockedRanges = parseICalData(icalText);

    // Cache the result
    cache.set(slug, {
      data: blockedRanges,
      expires: Date.now() + CACHE_TTL,
    });

    return res.status(200).json({
      propertySlug: slug,
      blockedRanges,
      lastUpdated: new Date().toISOString(),
      cached: false,
    } as AvailabilityResponse);

  } catch (error) {
    console.error('Availability fetch error:', error);

    // Return cached data if available, even if expired
    if (cached) {
      return res.status(200).json({
        propertySlug: slug,
        blockedRanges: cached.data,
        lastUpdated: new Date(cached.expires - CACHE_TTL).toISOString(),
        cached: true,
        stale: true,
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch availability',
      propertySlug: slug,
      blockedRanges: [],
    });
  }
}
