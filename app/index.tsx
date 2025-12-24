import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { HeroSection } from '@/components/hero-section';
import { LocationButton } from '@/components/location-button';
import { useCities } from '@/hooks/use-cities';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { SearchParams } from '@/types/search';

export default function HomeScreen() {
  const router = useRouter();
  const { cities, loading, error } = useCities();

  const handleSearchSubmit = (searchParams: SearchParams) => {
    // Navigate to results with search params
    const categoryParam = searchParams.categories.join(',');
    router.push(`/results?category=${categoryParam}&adults=${searchParams.guests.adults}&children=${searchParams.guests.children}` as any);
  };

  const handleLocationPress = (cityId: number) => {
    router.push(`/results?destination=${cityId}` as any);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <HeroSection onSearchSubmit={handleSearchSubmit} />

        {/* Featured Destinations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Discover our curated collection of exclusive rental properties
            across the world's most prestigious destinations.
          </Text>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.secondary} />
              <Text style={styles.loadingText}>Loading destinations...</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load destinations</Text>
            </View>
          )}

          {!loading && !error && cities.length > 0 && (
            <View style={styles.destinationsGrid}>
              {cities.map((city) => (
                <LocationButton
                  key={city.id}
                  city={city}
                  onPress={handleLocationPress}
                />
              ))}
            </View>
          )}
        </View>

        {/* Why ERentals Exclusive Section */}
        <View style={[styles.section, styles.featuresSection]}>
          <Text style={styles.sectionTitle}>Why ERentals Exclusive</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>Curated Selection</Text>
              <Text style={styles.featureText}>
                Every property is handpicked and verified to ensure the highest
                standards of luxury and comfort.
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>White-Glove Service</Text>
              <Text style={styles.featureText}>
                Our dedicated concierge team is available 24/7 to ensure your
                stay is flawless from start to finish.
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>Global Reach</Text>
              <Text style={styles.featureText}>
                Access exclusive properties in the world's most sought-after
                destinations, all in one place.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.section, styles.ctaSection]}>
          <Text style={styles.ctaTitle}>List Your Property</Text>
          <Text style={styles.ctaText}>
            Join our exclusive network and showcase your property to discerning
            guests worldwide.
          </Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.section,
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: Typography.h2.fontSize,
    color: BrandColors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  sectionSubtitle: {
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
  destinationsGrid: {
    width: '100%',
    gap: Spacing.md,
  },
  featuresSection: {
    backgroundColor: BrandColors.gray.light,
  },
  featuresGrid: {
    gap: Spacing.lg,
  },
  featureCard: {
    backgroundColor: BrandColors.white,
    padding: Spacing.lg,
    borderRadius: 10,
  },
  featureTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: BrandColors.primary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  featureText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: BrandColors.gray.dark,
  },
  ctaSection: {
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 32,
    color: BrandColors.white,
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  ctaText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 18,
    lineHeight: 28,
    color: BrandColors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});
