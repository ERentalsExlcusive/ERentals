import { View, Text, StyleSheet, ImageBackground, Platform, useWindowDimensions } from 'react-native';
import { SearchBar, SearchParams } from './search-bar';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Container } from '@/constants/design-tokens';
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
    maxWidth: Container.listing,
    paddingHorizontal: Space[12],
    alignItems: 'center',
    gap: Space[12],
    zIndex: 2,
  },
  contentMobile: {
    paddingHorizontal: Space[4],
    gap: Space[6],
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Space[6],
  },
  title: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: FontWeight.bold,
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: Space[4],
    letterSpacing: -1,
  },
  titleMobile: {
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
    marginBottom: Space[2],
  },
  titleTablet: {
    fontSize: 48,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl + 4,
    fontWeight: FontWeight.normal,
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 600,
    opacity: 0.95,
  },
  subtitleMobile: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    maxWidth: 320,
  },
});
