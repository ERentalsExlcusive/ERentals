import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { LocationButton } from '@/components/location-button';
import { useCities } from '@/hooks/use-cities';
import { BrandColors, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { cities, loading, error } = useCities();

  const handleLocationPress = (cityId: number) => {
    router.push(`/explore?city=${cityId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.brandName}>ERentals</Text>
        <Text style={styles.brandTagline}>Exclusive</Text>
        <View style={styles.divider} />
        <Text style={styles.heroSubtitle}>
          Luxury Properties for Discerning Guests
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentSection}>
        <Text style={styles.sectionTitle}>Explore Locations</Text>
        <Text style={styles.bodyText}>
          Discover our curated collection of exclusive rental properties
          across the world's most prestigious destinations.
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.secondary} />
            <Text style={styles.loadingText}>Loading locations...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load locations</Text>
          </View>
        )}

        {!loading && !error && cities.length > 0 && (
          <View style={styles.locationsGrid}>
            {cities.map((city) => (
              <LocationButton
                key={city.id}
                city={city}
                onPress={handleLocationPress}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  heroSection: {
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.section,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 56,
    color: BrandColors.white,
    letterSpacing: 2,
  },
  brandTagline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    color: BrandColors.secondary,
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: -8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.lg,
  },
  heroSubtitle: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 18,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: Typography.h2.fontSize,
    color: BrandColors.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  bodyText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.medium,
    marginTop: Spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  errorText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.medium,
  },
  locationsGrid: {
    width: '100%',
  },
});
