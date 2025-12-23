import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { BrandColors, Typography, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  const handleExplorePress = () => {
    router.push('/explore');
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

      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Welcome</Text>
        <Text style={styles.bodyText}>
          Discover our curated collection of exclusive rental properties.
          Each residence is handpicked to deliver an unparalleled experience
          of elegance and comfort.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed
          ]}
          onPress={handleExplorePress}
        >
          <Text style={styles.buttonText}>Explore Properties</Text>
        </Pressable>
      </View>
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
  contentSection: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: Typography.h2.fontSize,
    color: BrandColors.primary,
    marginBottom: Spacing.md,
  },
  bodyText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonPressed: {
    backgroundColor: BrandColors.primary,
  },
  buttonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: Typography.button.fontSize,
    color: BrandColors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
