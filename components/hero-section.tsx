import { StyleSheet, View, Text, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SearchContainer } from './search/search-container';
import { BrandColors, Typography, Spacing } from '@/constants/theme';
import { SearchParams } from '@/types/search';

export interface HeroSectionProps {
  backgroundImageUrl?: string;
  onSearchSubmit?: (searchParams: SearchParams) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(SCREEN_HEIGHT * 0.85, 800);

export function HeroSection({
  backgroundImageUrl = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80', // Luxury villa default
  onSearchSubmit,
}: HeroSectionProps) {
  return (
    <ImageBackground
      source={{ uri: backgroundImageUrl }}
      style={styles.container}
      imageStyle={styles.image}
    >
      <LinearGradient
        colors={['rgba(31, 40, 57, 0.4)', 'rgba(31, 40, 57, 0.8)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>ERentals</Text>
            <Text style={styles.brandTagline}>EXCLUSIVE</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>
              Luxury Properties for Discerning Guests
            </Text>
          </View>

          {/* Search Container */}
          <View style={styles.searchWrapper}>
            <SearchContainer variant="expanded" onSearch={onSearchSubmit} />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HERO_HEIGHT,
  },
  image: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.section,
  },
  content: {
    width: '100%',
    maxWidth: 1200,
    alignItems: 'center',
    gap: Spacing.xxl,
  },
  brandSection: {
    alignItems: 'center',
  },
  brandName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 64,
    color: BrandColors.white,
    letterSpacing: 3,
    textAlign: 'center',
  },
  brandTagline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: BrandColors.secondary,
    letterSpacing: 12,
    marginTop: -8,
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.lg,
  },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 20,
    color: BrandColors.white,
    textAlign: 'center',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  searchWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});
