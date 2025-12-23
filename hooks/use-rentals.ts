/**
 * React hooks for fetching rental data
 */

import { useState, useEffect, useCallback } from 'react';
import { Rental, TaxonomyTerm, RentalListParams } from '@/types/rental';
import {
  getRentals,
  getRentalById,
  getCities,
  getCountries,
  getRentalCategories,
} from '@/services/api';

interface UseRentalsResult {
  rentals: Rental[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  page: number;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useRentals(params: RentalListParams = {}): UseRentalsResult {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await getRentals({ ...params, page: 1 });

        if (!cancelled) {
          setRentals(response.data);
          setTotal(response.total);
          setTotalPages(response.totalPages);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRentals({ ...params, page: 1 });
      setRentals(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  const loadMore = useCallback(async () => {
    if (page < totalPages && !loading) {
      try {
        setLoading(true);
        const response = await getRentals({ ...params, page: page + 1 });
        setRentals((prev) => [...prev, ...response.data]);
        setPage(page + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rentals');
      } finally {
        setLoading(false);
      }
    }
  }, [page, totalPages, loading, paramsKey]);

  return {
    rentals,
    loading,
    error,
    total,
    totalPages,
    page,
    refresh,
    loadMore,
    hasMore: page < totalPages,
  };
}

interface UseRentalResult {
  rental: Rental | null;
  loading: boolean;
  error: string | null;
}

export function useRental(id: number): UseRentalResult {
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRentalById(id);
        setRental(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rental');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  return { rental, loading, error };
}

interface UseTaxonomyResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useCities(): UseTaxonomyResult<TaxonomyTerm> {
  const [data, setData] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const cities = await getCities();
        setData(cities);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cities');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useCountries(): UseTaxonomyResult<TaxonomyTerm> {
  const [data, setData] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const countries = await getCountries();
        setData(countries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export function useRentalCategories(): UseTaxonomyResult<TaxonomyTerm> {
  const [data, setData] = useState<TaxonomyTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const categories = await getRentalCategories();
        setData(categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
