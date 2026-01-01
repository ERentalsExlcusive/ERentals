import { View, Text, StyleSheet, ImageBackground, Dimensions, Platform } from 'react-native';
import { SearchBar, SearchParams } from './search-bar';
import { BrandColors, Spacing } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeroProps {
  imageUrl?: string;
  onSearch?: (params: SearchParams) => void;
}

export function Hero({ imageUrl, onSearch }: HeroProps) {
  // Default hero image
  const heroImage = imageUrl || 'https://erentalsexclusive.com/wp-content/uploads/2025/12/9-17.webp';

  return (
    <ImageBackground
      source={{ uri: heroImage }}
      style={styles.hero}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Discover Luxury</Text>
          <Text style={styles.subtitle}>
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
    height: Platform.OS === 'web' ? '100vh' : SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 64 : 48,
    fontWeight: '700',
    color: BrandColors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    color: BrandColors.white,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 28,
    opacity: 0.95,
  },
});
