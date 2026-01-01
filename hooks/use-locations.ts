import { useState, useEffect } from 'react';
import { getCities, getCountries } from '@/services/api';
import { TaxonomyTerm } from '@/types/rental';

export interface Location {
  id: number;
  name: string;
  type: 'city' | 'country';
  slug: string;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);

        // Fetch both cities and countries
        const [cities, countries] = await Promise.all([
          getCities(),
          getCountries(),
        ]);

        // Combine and format
        const allLocations: Location[] = [
          ...cities.filter(c => c.count > 0).map(c => ({
            id: c.id,
            name: c.name,
            type: 'city' as const,
            slug: c.slug,
          })),
          ...countries.filter(c => c.count > 0).map(c => ({
            id: c.id,
            name: c.name,
            type: 'country' as const,
            slug: c.slug,
          })),
        ];

        // Sort by name
        allLocations.sort((a, b) => a.name.localeCompare(b.name));

        setLocations(allLocations);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch locations'));
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  return { locations, loading, error };
}
