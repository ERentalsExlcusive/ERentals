import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { SearchParams } from '@/components/search-bar';
import { CategoryTabs } from '@/components/category-tabs';
import { PropertyGrid } from '@/components/property-grid';
import { BrandButton } from '@/components/brand-button';
import { PropertyCardSkeleton } from '@/components/skeleton-loader';
import { useRentals } from '@/hooks/use-rentals';
import { getPropertyDataBySlug } from '@/data/property-data';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight } from '@/constants/design-tokens';
import { Rental } from '@/types/rental';
import { useSearchContext } from '@/context/search-context';

// Main rental categories from WordPress
// Villa ID: 44, Yacht ID: 45, Transport ID: 84, Property ID: 99, Hotel ID: 102
const CATEGORIES = [
  { id: 'all' as const, name: 'All', slug: 'all' },
  { id: 44, name: 'Villas', slug: 'villa' },
  { id: 45, name: 'Yachts', slug: 'yacht' },
  { id: 84, name: 'Transport', slug: 'transport' },
];

export default function HomeScreen() {
  const router = useRouter();
  const urlParams = useLocalSearchParams<{
    category?: string;
    destination?: string;
    destinationId?: string;
    destinationType?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const { setSearchState } = useSearchContext();
  const [hasHydratedFromUrl, setHasHydratedFromUrl] = useState(false);

  // Hydrate search state from URL params on mount
  useEffect(() => {
    if (hasHydratedFromUrl) return;

    const hasUrlSearchParams = urlParams.destination || urlParams.checkIn || urlParams.guests;
    if (hasUrlSearchParams) {
      const hydratedParams: SearchParams = {
        destination: urlParams.destination || '',
        destinationId: urlParams.destinationId ? parseInt(urlParams.destinationId) : undefined,
        destinationType: urlParams.destinationType as 'city' | 'country' | undefined,
        checkIn: urlParams.checkIn ? new Date(urlParams.checkIn) : null,
        checkOut: urlParams.checkOut ? new Date(urlParams.checkOut) : null,
        guests: urlParams.guests ? parseInt(urlParams.guests) : 2,
      };

      setSearchParams(hydratedParams);
      setSearchState(hydratedParams);
      setHasHydratedFromUrl(true);

      // Scroll to results if we have search params
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: typeof window !== 'undefined' ? window.innerHeight : 800,
          animated: true
        });
      }, 300);
    } else {
      setHasHydratedFromUrl(true);
    }
  }, [urlParams, hasHydratedFromUrl, setSearchState]);

  // Handle category from URL parameter
  useEffect(() => {
    if (urlParams.category) {
      const categoryMap: Record<string, number> = {
        villa: 44,
        yacht: 45,
        transport: 84,
      };
      const categoryId = categoryMap[urlParams.category];
      if (categoryId) {
        setSelectedCategory(categoryId);
        // Scroll to collection section
        if (scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({
              y: typeof window !== 'undefined' ? window.innerHeight : 800,
              animated: true
            });
          }, 100);
        }
      }
    }
  }, [urlParams.category]);

  // Build API params from search and category
  const apiParams = {
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    perPage: 12,
    // Add location filters from search
    ...(searchParams?.destinationType === 'city' && searchParams.destinationId
      ? { city: searchParams.destinationId }
      : {}),
    ...(searchParams?.destinationType === 'country' && searchParams.destinationId
      ? { country: searchParams.destinationId }
      : {}),
    // Add general search if destination name is provided without ID
    ...(searchParams?.destination && !searchParams.destinationId
      ? { search: searchParams.destination }
      : {}),
  };

  const { rentals, loading, error, loadMore, hasMore, total } = useRentals(apiParams);

  // Filter rentals by guest capacity on client side
  const filteredRentals = useMemo(() => {
    if (!searchParams?.guests || searchParams.guests <= 1) {
      return rentals;
    }

    return rentals.filter(rental => {
      const propertyData = getPropertyDataBySlug(rental.slug);
      if (!propertyData || !propertyData.guestMax) {
        return true; // Include if no data (don't filter out)
      }
      return propertyData.guestMax >= searchParams.guests;
    });
  }, [rentals, searchParams?.guests]);

  const handlePropertyPress = (rental: Rental) => {
    router.push(`/property/${rental.id}`);
  };

  const handleSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setSearchState(params);

    // Sync to URL for persistence & shareability
    const urlSearchParams = new URLSearchParams();
    if (params.destination) urlSearchParams.set('destination', params.destination);
    if (params.destinationId) urlSearchParams.set('destinationId', String(params.destinationId));
    if (params.destinationType) urlSearchParams.set('destinationType', params.destinationType);
    if (params.checkIn) urlSearchParams.set('checkIn', params.checkIn.toISOString());
    if (params.checkOut) urlSearchParams.set('checkOut', params.checkOut.toISOString());
    if (params.guests && params.guests !== 2) urlSearchParams.set('guests', String(params.guests));
    if (selectedCategory !== 'all') {
      const categorySlug = CATEGORIES.find(c => c.id === selectedCategory)?.slug;
      if (categorySlug) urlSearchParams.set('category', categorySlug);
    }

    const queryString = urlSearchParams.toString();
    // Use replace to avoid cluttering browser history
    if (typeof window !== 'undefined') {
      const newUrl = queryString ? `/?${queryString}` : '/';
      window.history.replaceState({}, '', newUrl);
    }

    // Only scroll if there's an actual search (not a reset)
    const hasSearchParams = params.destination || params.checkIn || params.checkOut || (params.guests && params.guests !== 2);
    if (hasSearchParams && scrollViewRef.current) {
      // Scroll to approximately where the section starts (100vh for hero)
      scrollViewRef.current.scrollTo({ y: typeof window !== 'undefined' ? window.innerHeight : 800, animated: true });
    }
  }, [selectedCategory, setSearchState]);

  const handleCategorySelect = (categoryId: number | 'all') => {
    setSelectedCategory(categoryId);
  };

  const handleHeaderCategorySelect = (category: 'villa' | 'yacht' | 'transport') => {
    // Map category names to IDs
    const categoryMap = {
      villa: 44,
      yacht: 45,
      transport: 84,
    };
    setSelectedCategory(categoryMap[category]);
    // Scroll to collection section
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: typeof window !== 'undefined' ? window.innerHeight : 800, animated: true });
    }
  };

  const handleHomePress = () => {
    // Scroll to top when Home is clicked
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    // Reset category to 'all' and clear search
    setSelectedCategory('all');
    setSearchParams(null);
    // Clear URL params
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/');
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <Header onCategorySelect={handleHeaderCategorySelect} onHomePress={handleHomePress} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Full-Screen Hero - ALWAYS VISIBLE */}
        <Hero
          imageUrl="https://erentalsexclusive.com/wp-content/uploads/2025/12/9-17.webp"
          onSearch={handleSearch}
        />

        {/* Collections/Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Our Collection</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredRentals.length} {filteredRentals.length === 1 ? 'listing' : 'listings'}
            </Text>
          </View>

          {/* Category Tabs - Centered */}
          <View style={styles.categoryTabsContainer}>
            <CategoryTabs
              categories={CATEGORIES}
              selectedId={selectedCategory}
              onSelect={handleCategorySelect}
            />
          </View>
        </View>

        {/* Properties Grid */}
        {loading && filteredRentals.length === 0 ? (
          <View style={styles.gridContainer}>
            <View style={styles.skeletonGrid}>
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </View>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load properties</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        ) : filteredRentals.length > 0 ? (
          <View style={styles.gridContainer}>
            <PropertyGrid
              properties={filteredRentals}
              onPropertyPress={handlePropertyPress}
              ListFooterComponent={
                hasMore && !loading ? (
                  <View style={styles.loadMoreContainer}>
                    <BrandButton
                      title="Load More Listings"
                      variant="ghost"
                      onPress={loadMore}
                    />
                  </View>
                ) : loading && filteredRentals.length > 0 ? (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color={BrandColors.gray.medium} />
                  </View>
                ) : null
              }
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No listings found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
    width: '100%',
    maxWidth: '100vw',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    width: '100%',
  },
  section: {
    paddingTop: Platform.select({ web: Space[20], default: Space[12] }),
    paddingBottom: Space[12],
    backgroundColor: BrandColors.white,
  },
  sectionHeader: {
    paddingHorizontal: Platform.select({ web: Space[12], default: Space[4] }),
    marginBottom: Space[6],
    alignItems: 'center',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Platform.select({ web: FontSize['4xl'], default: FontSize['2xl'] }),
    lineHeight: Platform.select({ web: LineHeight['4xl'], default: LineHeight['2xl'] }),
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[2],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.dark,
    textAlign: 'center',
  },
  categoryTabsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flex: 1,
  },
  skeletonGrid: {
    paddingHorizontal: Platform.select({ web: Space[12], default: Space[4] }),
    paddingTop: Space[4],
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  loadingContainer: {
    paddingVertical: Space[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Space[4],
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.medium,
  },
  errorContainer: {
    paddingVertical: Space[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  errorSubtext: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  emptyContainer: {
    paddingVertical: Space[24],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.medium,
  },
  loadMoreContainer: {
    paddingVertical: Space[12],
    alignItems: 'center',
  },
  loadingMore: {
    paddingVertical: Space[6],
    alignItems: 'center',
  },
});
