/**
 * Hook for fetching owner portal data from Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useOwnerAuth } from '@/context/owner-auth-context';
import { MOCK_ASSETS, MOCK_INQUIRIES, OwnerAsset, OwnerInquiry } from '@/data/mock-owner-data';

interface OwnerStats {
  totalAssets: number;
  totalInquiries: number;
  newInquiries: number;
  confirmedBookings: number;
}

interface UseOwnerDataResult {
  assets: OwnerAsset[];
  inquiries: OwnerInquiry[];
  stats: OwnerStats;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOwnerData(): UseOwnerDataResult {
  const { user, isAuthenticated } = useOwnerAuth();
  const [assets, setAssets] = useState<OwnerAsset[]>([]);
  const [inquiries, setInquiries] = useState<OwnerInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        // Fetch assets from Supabase
        const { data: assetsData, error: assetsError } = await supabase
          .from('owner_assets')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (assetsError) throw assetsError;

        // Transform to match OwnerAsset interface
        const transformedAssets: OwnerAsset[] = (assetsData || []).map((asset: any) => ({
          id: asset.id,
          slug: asset.property_slug,
          name: asset.property_name,
          status: asset.status,
          stats: { views: 0, inquiries: 0, bookings: 0 }, // Will be calculated from inquiries
        }));

        // Fetch inquiries from Supabase
        const { data: inquiriesData, error: inquiriesError } = await supabase
          .from('inquiries')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (inquiriesError) throw inquiriesError;

        // Transform to match OwnerInquiry interface
        const transformedInquiries: OwnerInquiry[] = (inquiriesData || []).map((inq: any) => ({
          id: inq.id,
          propertySlug: inq.property_slug,
          propertyName: transformedAssets.find(a => a.slug === inq.property_slug)?.name || inq.property_slug,
          guestName: inq.guest_name,
          guestEmail: inq.guest_email,
          guestPhone: inq.guest_phone || undefined,
          checkIn: inq.check_in,
          checkOut: inq.check_out,
          guests: inq.guests,
          message: inq.message || undefined,
          stage: inq.stage,
          notes: inq.notes || undefined,
          createdAt: inq.created_at,
          updatedAt: inq.updated_at,
        }));

        // Calculate per-asset stats
        const assetStatsMap: Record<string, { inquiries: number; bookings: number }> = {};
        transformedInquiries.forEach(inq => {
          if (!assetStatsMap[inq.propertySlug]) {
            assetStatsMap[inq.propertySlug] = { inquiries: 0, bookings: 0 };
          }
          assetStatsMap[inq.propertySlug].inquiries++;
          if (inq.stage === 'confirmed') {
            assetStatsMap[inq.propertySlug].bookings++;
          }
        });

        // Update asset stats
        transformedAssets.forEach(asset => {
          const stats = assetStatsMap[asset.slug];
          if (stats) {
            asset.stats.inquiries = stats.inquiries;
            asset.stats.bookings = stats.bookings;
          }
        });

        setAssets(transformedAssets);
        setInquiries(transformedInquiries);
      } else {
        // Fall back to mock data
        setAssets(MOCK_ASSETS);
        setInquiries(MOCK_INQUIRIES);
      }
    } catch (err: any) {
      console.error('Error fetching owner data:', err);
      setError(err.message || 'Failed to fetch data');
      // Fall back to mock data on error
      setAssets(MOCK_ASSETS);
      setInquiries(MOCK_INQUIRIES);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const stats: OwnerStats = {
    totalAssets: assets.length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.stage === 'new').length,
    confirmedBookings: inquiries.filter(i => i.stage === 'confirmed').length,
  };

  return {
    assets,
    inquiries,
    stats,
    isLoading,
    error,
    refresh: fetchData,
  };
}

// Get recent inquiries helper
export function getRecentInquiries(inquiries: OwnerInquiry[], count: number = 5): OwnerInquiry[] {
  return inquiries.slice(0, count);
}
