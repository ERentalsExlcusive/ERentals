import { StyleSheet, View, Text, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/context/auth-context';
import { Header } from '@/components/header';
import { PropertyCard } from '@/components/property-card';
import { useRentals } from '@/hooks/use-rentals';
import { useMemo } from 'react';

export default function FavoritesScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { user, isAuthenticated } = useAuth();
  const { favorites, isLoading: isFavoritesLoading, removeFavorite } = useFavorites();
  const { rentals, isLoading: isRentalsLoading } = useRentals({ perPage: 100 });

  // Get full rental data for favorited properties
  const favoriteRentals = useMemo(() => {
    if (!rentals.length || !favorites.length) return [];

    const favoriteIds = new Set(favorites.map(f => f.propertyId));
    return rentals.filter(r => favoriteIds.has(r.id));
  }, [rentals, favorites]);

  const isLoading = isFavoritesLoading || isRentalsLoading;

  const handleCategorySelect = (category: 'villa' | 'yacht' | 'transport') => {
    router.push(`/?category=${category}`);
  };

  return (
    <View style={styles.container}>
      <Header
        onHomePress={() => router.push('/')}
        onCategorySelect={handleCategorySelect}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={BrandColors.black} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>
                Saved Properties
              </Text>
              <Text style={styles.subtitle}>
                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
              </Text>
            </View>
          </View>

          {/* Auth prompt for anonymous users */}
          {user?.isAnonymous && favorites.length > 0 && (
            <View style={styles.authPrompt}>
              <Feather name="info" size={16} color={BrandColors.secondary} />
              <Text style={styles.authPromptText}>
                Sign in to sync your favorites across devices
              </Text>
            </View>
          )}

          {/* Loading state */}
          {isLoading ? (
            <View style={styles.emptyState}>
              <Feather name="loader" size={32} color={BrandColors.gray.medium} />
              <Text style={styles.emptyText}>Loading favorites...</Text>
            </View>
          ) : favorites.length === 0 ? (
            /* Empty state */
            <View style={styles.emptyState}>
              <Feather name="heart" size={48} color={BrandColors.gray.medium} />
              <Text style={styles.emptyTitle}>No saved properties yet</Text>
              <Text style={styles.emptyText}>
                Tap the heart icon on any property to save it here
              </Text>
              <Pressable
                style={styles.browseButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.browseButtonText}>Browse Properties</Text>
              </Pressable>
            </View>
          ) : (
            /* Favorites grid */
            <View style={[styles.grid, isMobile && styles.gridMobile]}>
              {favoriteRentals.map((rental) => (
                <View
                  key={rental.id}
                  style={[styles.cardWrapper, isMobile && styles.cardWrapperMobile]}
                >
                  <PropertyCard
                    rental={rental}
                    isFavorite={true}
                    onFavoritePress={() => removeFavorite(rental.id)}
                    onPress={(r) => router.push(`/property/${r.id}`)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
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
  },
  content: {
    padding: Space[8],
    paddingTop: 80, // Account for fixed header
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    padding: Space[4],
    paddingTop: 72,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[4],
    marginBottom: Space[8],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    letterSpacing: -0.5,
  },
  titleMobile: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  authPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: `${BrandColors.secondary}10`,
    padding: Space[4],
    borderRadius: Radius.lg,
    marginBottom: Space[6],
  },
  authPromptText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Space[20],
    gap: Space[4],
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  emptyText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    maxWidth: 280,
  },
  browseButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    paddingHorizontal: Space[8],
    borderRadius: Radius.md,
    marginTop: Space[4],
  },
  browseButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[6],
  },
  gridMobile: {
    gap: Space[4],
  },
  cardWrapper: {
    width: Platform.select({ web: 'calc(33.333% - 16px)', default: '100%' }) as any,
  },
  cardWrapperMobile: {
    width: '100%',
  },
});
