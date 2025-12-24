import { useState, useEffect } from 'react';
import { getCities, getRentals } from '@/services/api';
import { TaxonomyTerm } from '@/types/rental';

export interface CityWithImage extends TaxonomyTerm {
  imageUrl?: string;
}

/**
 * Hook to fetch cities with featured images from rental properties
 */
export function useCities() {
  const [cities, setCities] = useState<CityWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCitiesWithImages() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all cities
        const citiesData = await getCities();

        // For each city, fetch one rental to get an image
        const citiesWithImages = await Promise.all(
          citiesData.map(async (city) => {
            try {
              // Get first rental for this city
              const rentalsResponse = await getRentals({
                city: city.id,
                perPage: 1,
              });

              const imageUrl = rentalsResponse.data[0]?.featuredImage?.sizes?.large
                || rentalsResponse.data[0]?.featuredImage?.url;

              return {
                ...city,
                imageUrl,
              };
            } catch (err) {
              // If no rentals found for this city, return without image
              return {
                ...city,
                imageUrl: undefined,
              };
            }
          })
        );

        // Filter out cities without images and with no count
        const validCities = citiesWithImages.filter(
          (city) => city.imageUrl && city.count > 0
        );

        setCities(validCities);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch cities'));
      } finally {
        setLoading(false);
      }
    }

    fetchCitiesWithImages();
  }, []);

  return { cities, loading, error };
}
