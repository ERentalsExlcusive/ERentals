import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { SearchParams } from '@/components/search-bar';
import { CategoryTabs } from '@/components/category-tabs';
import { PropertyGrid } from '@/components/property-grid';
import { BrandButton } from '@/components/brand-button';
import { useRentals } from '@/hooks/use-rentals';
import { BrandColors, Spacing } from '@/constants/theme';
import { Rental } from '@/types/rental';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

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

  const handlePropertyPress = (rental: Rental) => {
    router.push(`/property/${rental.id}`);
  };

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    // Only scroll if there's an actual search (not a reset)
    const hasSearchParams = params.destination || params.checkIn || params.checkOut || (params.guests && params.guests !== 2);
    if (hasSearchParams && scrollViewRef.current) {
      // Scroll to approximately where the section starts (100vh for hero)
      scrollViewRef.current.scrollTo({ y: typeof window !== 'undefined' ? window.innerHeight : 800, animated: true });
    }
    console.log('Searching with params:', params);
  };

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

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <Header onCategorySelect={handleHeaderCategorySelect} />

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
              {total || rentals.length} {total === 1 ? 'listing' : 'listings'}
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
        {loading && rentals.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.black} />
            <Text style={styles.loadingText}>Loading properties...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load properties</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        ) : rentals.length > 0 ? (
          <View style={styles.gridContainer}>
            <PropertyGrid
              properties={rentals}
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
                ) : loading && rentals.length > 0 ? (
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
  },
  scrollView: {
    flex: 1,
    marginTop: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },
  section: {
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xxl,
    backgroundColor: BrandColors.white,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
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
  loadingContainer: {
    paddingVertical: Spacing.xxl * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 15,
    color: BrandColors.gray.medium,
  },
  errorContainer: {
    paddingVertical: Spacing.xxl * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  errorSubtext: {
    fontSize: 14,
    color: BrandColors.gray.medium,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl * 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: BrandColors.gray.medium,
  },
  loadMoreContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
