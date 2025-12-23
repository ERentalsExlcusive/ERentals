import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { RentalCard } from '@/components/rental-card';
import { useRentals } from '@/hooks/use-rentals';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { Rental } from '@/types/rental';

export default function ExploreScreen() {
  const { rentals, loading, error, refresh, loadMore, hasMore, total } = useRentals({
    perPage: 10,
  });

  const handleRentalPress = (rental: Rental) => {
    // TODO: Navigate to rental detail screen
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Our Properties</Text>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>
        {total > 0 ? `${total} exclusive listings` : 'Explore our collection'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={BrandColors.secondary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error || 'No properties found'}
        </Text>
      </View>
    );
  };

  if (loading && rentals.length === 0) {
    return (
      <ThemedView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.secondary} />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={rentals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RentalCard rental={item} onPress={handleRentalPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loading && rentals.length > 0}
            onRefresh={refresh}
            tintColor={BrandColors.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: Typography.h2.fontSize,
    color: BrandColors.primary,
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.md,
  },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: Typography.body.fontSize,
    color: BrandColors.gray.dark,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: Typography.body.fontSize,
    color: BrandColors.gray.medium,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: Typography.body.fontSize,
    color: BrandColors.gray.medium,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
