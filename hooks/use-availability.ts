import { useState, useEffect, useCallback } from 'react';

interface BlockedRange {
  start: string; // ISO date string YYYY-MM-DD
  end: string;   // ISO date string YYYY-MM-DD
  summary?: string;
}

interface AvailabilityData {
  propertySlug: string;
  blockedRanges: BlockedRange[];
  lastUpdated: string;
  cached: boolean;
}

interface UseAvailabilityResult {
  blockedRanges: BlockedRange[];
  blockedDates: Set<string>;
  isLoading: boolean;
  error: string | null;
  isDateBlocked: (date: Date) => boolean;
  isRangeAvailable: (startDate: Date, endDate: Date) => boolean;
  refresh: () => void;
}

/**
 * Hook to fetch and manage property availability
 */
export function useAvailability(propertySlug: string | null): UseAvailabilityResult {
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!propertySlug) {
      setBlockedRanges([]);
      setBlockedDates(new Set());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use relative URL for API endpoint
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : '';
      const response = await fetch(`${baseUrl}/api/availability?slug=${encodeURIComponent(propertySlug)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data: AvailabilityData = await response.json();
      setBlockedRanges(data.blockedRanges);

      // Generate set of all blocked dates for quick lookup
      const dates = new Set<string>();
      for (const range of data.blockedRanges) {
        const start = new Date(range.start);
        const end = new Date(range.end);

        // Add all dates in the range
        const current = new Date(start);
        while (current < end) {
          dates.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      }
      setBlockedDates(dates);

    } catch (err) {
      console.error('Availability fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
      // Don't clear existing data on error
    } finally {
      setIsLoading(false);
    }
  }, [propertySlug]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  /**
   * Check if a specific date is blocked
   */
  const isDateBlocked = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return blockedDates.has(dateStr);
  }, [blockedDates]);

  /**
   * Check if a date range is fully available
   */
  const isRangeAvailable = useCallback((startDate: Date, endDate: Date): boolean => {
    const current = new Date(startDate);
    while (current <= endDate) {
      if (isDateBlocked(current)) {
        return false;
      }
      current.setDate(current.getDate() + 1);
    }
    return true;
  }, [isDateBlocked]);

  return {
    blockedRanges,
    blockedDates,
    isLoading,
    error,
    isDateBlocked,
    isRangeAvailable,
    refresh: fetchAvailability,
  };
}
