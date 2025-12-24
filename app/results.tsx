import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { NavigationHeader } from '@/components/navigation-header';
import { RentalCard } from '@/components/rental-card';
import { useRentals } from '@/hooks/use-rentals';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { getWordPressCategoryIds } from '@/constants/category-mapping';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    destination?: string;
    adults?: string;
    children?: string;
  }>();
  const router = useRouter();

  // Parse URL parameters
  const categoryIds = params.category
    ? params.category.split(',').flatMap(id => getWordPressCategoryIds(id))
    : [];
  const destinationId = params.destination ? parseInt(params.destination) : undefined;
  const adults = params.adults ? parseInt(params.adults) : 2;
  const children = params.children ? parseInt(params.children) : 0;

  // For now, use the first category ID if multiple are selected
  const categoryId = categoryIds.length > 0 ? categoryIds[0] : undefined;

  // Fetch rentals based on search params
  const { rentals, loading, error, refresh, loadMore, hasMore } = useRentals({
    category: categoryId,
    city: destinationId,
    perPage: 12,
  });

  const handlePropertyPress = (rentalId: number) => {
    router.push(`/property/${rentalId}` as any);
  };

  const handleSearchPress = () => {
    // TODO: Open search modal in Phase 2
    console.log('Search pressed');
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <NavigationHeader
        variant="solid"
        showSearch={true}
        onSearchPress={handleSearchPress}
      />

      {/* Search Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {loading ? 'Searching...' : `${rentals.length} properties found`}
        </Text>
        {params.category && (
          <Text style={styles.summaryDetail}>
            Category: {params.category} • {adults} adults
            {children > 0 && `, ${children} children`}
          </Text>
        )}
      </View>

      {/* Results List */}
      {loading && rentals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.secondary} />
          <Text style={styles.loadingText}>Finding perfect properties...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load properties</Text>
          <Text style={styles.errorSubtext}>{error.message}</Text>
        </View>
      ) : rentals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No properties found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search filters</Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RentalCard
                rental={item}
                onPress={() => handlePropertyPress(item.id)}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={refresh}
          refreshing={loading}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={BrandColors.secondary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  summary: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.light,
  },
  summaryText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: BrandColors.primary,
    marginBottom: Spacing.xs,
  },
  summaryDetail: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.medium,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  cardWrapper: {
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  loadingText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.medium,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  errorText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.sm,
  },
  errorSubtext: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: BrandColors.gray.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.medium,
  },
  footerLoading: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
});
