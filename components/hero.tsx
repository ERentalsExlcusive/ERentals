import { View, Text, StyleSheet, ImageBackground, Platform, useWindowDimensions } from 'react-native';
import { SearchBar, SearchParams } from './search-bar';
import { BrandColors, Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

interface HeroProps {
  imageUrl?: string;
  onSearch?: (params: SearchParams) => void;
}

export function Hero({ imageUrl, onSearch }: HeroProps) {
  const { height } = useWindowDimensions();
  const { isMobile, isTablet } = useResponsive();

  // Default hero image
  const heroImage = imageUrl || 'https://erentalsexclusive.com/wp-content/uploads/2025/12/9-17.webp';

  return (
    <ImageBackground
      source={{ uri: heroImage }}
      style={[
        styles.hero,
        Platform.OS === 'web' ? { height: '100vh' } : { height },
        isMobile && styles.heroMobile,
      ]}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={[
        styles.content,
        isMobile && styles.contentMobile,
      ]}>
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            isMobile && styles.titleMobile,
            isTablet && styles.titleTablet,
          ]}>
            Discover Luxury
          </Text>
          <Text style={[
            styles.subtitle,
            isMobile && styles.subtitleMobile,
          ]}>
            Curated collection of exclusive villas, yachts, and premium transport
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar onSearch={onSearch} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMobile: {
    minHeight: 600,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.xxl,
    zIndex: 2,
  },
  contentMobile: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 64,
    fontWeight: '700',
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  titleMobile: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  titleTablet: {
    fontSize: 48,
  },
  subtitle: {
    fontSize: 20,
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 28,
    opacity: 0.95,
  },
  subtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
});
