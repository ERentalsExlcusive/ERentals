import { useState, useEffect, useMemo } from 'react';
import { getCities, getCountries, getRentals } from '@/services/api';
import { TaxonomyTerm } from '@/types/rental';
import { PROPERTY_DATA } from '@/data/property-data';

export interface Destination {
  id: number;
  name: string;
  type: 'city' | 'country';
  slug: string;
  imageUrl?: string;
  propertyCount: number;
  startingPrice?: string;
  categories?: { villas: number; yachts: number; transport: number };
}

// Pre-compute destination stats from property data
function getDestinationStats() {
  const stats: Record<string, {
    count: number;
    minPrice: number;
    categories: { villas: number; yachts: number; transport: number };
  }> = {};

  Object.values(PROPERTY_DATA).forEach(property => {
    const cityKey = property.city.toLowerCase();
    const countryKey = property.country.toLowerCase();

    // Initialize if needed
    [cityKey, countryKey].forEach(key => {
      if (!stats[key]) {
        stats[key] = { count: 0, minPrice: Infinity, categories: { villas: 0, yachts: 0, transport: 0 } };
      }
    });

    // Update counts
    stats[cityKey].count++;
    stats[countryKey].count++;

    // Track category breakdown
    if (property.category === 'villa' || property.category === 'property' || property.category === 'hotel') {
      stats[cityKey].categories.villas++;
      stats[countryKey].categories.villas++;
    } else if (property.category === 'yacht') {
      stats[cityKey].categories.yachts++;
      stats[countryKey].categories.yachts++;
    } else if (property.category === 'transport') {
      stats[cityKey].categories.transport++;
      stats[countryKey].categories.transport++;
    }

    // Extract price if available
    const priceMatch = property.displayPrice?.match(/\$[\d,]+/);
    if (priceMatch) {
      const price = parseInt(priceMatch[0].replace(/[$,]/g, ''));
      if (price < stats[cityKey].minPrice) stats[cityKey].minPrice = price;
      if (price < stats[countryKey].minPrice) stats[countryKey].minPrice = price;
    }
  });

  return stats;
}

const DESTINATION_STATS = getDestinationStats();

// Featured destinations with curated images
const FEATURED_DESTINATIONS: Record<string, string> = {
  'miami': 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400&q=80',
  'tulum': 'https://images.unsplash.com/photo-1682553064442-d9d62f53f8a9?w=400&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=400&q=80',
  'puerto escondido': 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=400&q=80',
  'mykonos': 'https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=400&q=80',
  'bodrum': 'https://images.unsplash.com/photo-1568322503535-f8cc8f3d5d7e?w=400&q=80',
  'monaco': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80',
  'cannes': 'https://images.unsplash.com/photo-1533929736562-6a5e90b83e87?w=400&q=80',
  'mexico': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&q=80',
  'usa': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400&q=80',
  'france': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80',
  'greece': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&q=80',
  'turkey': 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400&q=80',
  'costa rica': 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=400&q=80',
  'colombia': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&q=80',
  'cuernavaca': 'https://images.unsplash.com/photo-1570737543098-0983d88f796d?w=400&q=80',
};

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both cities and countries
        const [cities, countries] = await Promise.all([
          getCities(),
          getCountries(),
        ]);

        // Also fetch one rental per popular city for images
        const cityImages: Record<string, string> = {};
        const popularCities = cities.filter(c => c.count > 0).slice(0, 10);

        await Promise.all(
          popularCities.map(async (city) => {
            try {
              const rentals = await getRentals({ city: city.id, perPage: 1 });
              const imageUrl = rentals.data[0]?.featuredImage?.sizes?.large ||
                              rentals.data[0]?.featuredImage?.url;
              if (imageUrl) {
                cityImages[city.name.toLowerCase()] = imageUrl;
              }
            } catch (e) {
              // Ignore errors for individual city fetches
            }
          })
        );

        // Combine and enhance with stats
        const allDestinations: Destination[] = [
          ...cities.filter(c => c.count > 0).map(c => {
            const key = c.name.toLowerCase();
            const stats = DESTINATION_STATS[key];
            return {
              id: c.id,
              name: c.name,
              type: 'city' as const,
              slug: c.slug,
              imageUrl: FEATURED_DESTINATIONS[key] || cityImages[key],
              propertyCount: stats?.count || c.count,
              startingPrice: stats && stats.minPrice !== Infinity ? `$${stats.minPrice.toLocaleString()}` : undefined,
              categories: stats?.categories,
            };
          }),
          ...countries.filter(c => c.count > 0).map(c => {
            const key = c.name.toLowerCase();
            const stats = DESTINATION_STATS[key];
            return {
              id: c.id,
              name: c.name,
              type: 'country' as const,
              slug: c.slug,
              imageUrl: FEATURED_DESTINATIONS[key],
              propertyCount: stats?.count || c.count,
              startingPrice: stats && stats.minPrice !== Infinity ? `$${stats.minPrice.toLocaleString()}` : undefined,
              categories: stats?.categories,
            };
          }),
        ];

        // Sort by property count (most popular first)
        allDestinations.sort((a, b) => b.propertyCount - a.propertyCount);

        setDestinations(allDestinations);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch destinations'));
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  // Featured destinations (top 6 with images)
  const featured = useMemo(() =>
    destinations.filter(d => d.imageUrl).slice(0, 6),
    [destinations]
  );

  return { destinations, featured, loading, error };
}
