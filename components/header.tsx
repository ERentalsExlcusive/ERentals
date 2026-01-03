import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, ZIndex } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';
import { useFavorites } from '@/hooks/use-favorites';

interface HeaderProps {
  onCategorySelect?: (category: 'villa' | 'yacht' | 'transport') => void;
  onHomePress?: () => void;
}

export function Header({ onCategorySelect, onHomePress }: HeaderProps = {}) {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { favoritesCount } = useFavorites();

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        {/* Logo */}
        <Pressable onPress={handleHomePress} style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://erentalsexclusive.com/wp-content/uploads/2025/06/ere.png' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* Navigation - Hidden on mobile */}
        {!isMobile && (
          <View style={styles.nav}>
            <Pressable onPress={handleHomePress}>
              <Text style={styles.navLink}>Home</Text>
            </Pressable>
            <Pressable onPress={() => onCategorySelect?.('villa')}>
              <Text style={styles.navLink}>Villas</Text>
            </Pressable>
            <Pressable onPress={() => onCategorySelect?.('yacht')}>
              <Text style={styles.navLink}>Yachts</Text>
            </Pressable>
            <Pressable onPress={() => onCategorySelect?.('transport')}>
              <Text style={styles.navLink}>Transport</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/collaborate')}>
              <Text style={styles.navLink}>Collaborate</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/blog')}>
              <Text style={styles.navLink}>Blog</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/about')}>
              <Text style={styles.navLink}>About Us</Text>
            </Pressable>
          </View>
        )}

        {/* Right side - Favorites & Owner Portal */}
        <View style={styles.rightSection}>
          <Pressable style={styles.favoritesButton} onPress={() => router.push('/favorites')}>
            <Feather name="heart" size={20} color={BrandColors.black} />
            {favoritesCount > 0 && (
              <View style={styles.favoritesBadge}>
                <Text style={styles.favoritesBadgeText}>{favoritesCount > 9 ? '9+' : favoritesCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={[styles.ownerPortal, isMobile && styles.ownerPortalMobile]} onPress={() => router.push('/owner-portal')}>
            <Text style={[styles.ownerPortalText, isMobile && styles.ownerPortalTextMobile]}>Owner Portal</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.sticky,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  headerMobile: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Space[4],
    paddingRight: Space[12],
    paddingVertical: Space[4],
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  containerMobile: {
    paddingLeft: Space[2],
    paddingRight: Space[2],
    paddingVertical: Space[2],
  },
  logoContainer: {
    height: 40,
    justifyContent: 'center',
    marginRight: 'auto',
    paddingRight: Space[12],
  },
  logoImage: {
    width: 50,
    height: 40,
  },
  nav: {
    flexDirection: 'row',
    gap: Space[6],
    flex: 1,
    justifyContent: 'center',
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  navLink: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
    opacity: 0.8,
  },
  ownerPortal: {
    paddingHorizontal: Space[4],
    paddingVertical: Space[2],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
  },
  ownerPortalMobile: {
    paddingHorizontal: Space[2],
    paddingVertical: Space[2],
  },
  ownerPortalText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ownerPortalTextMobile: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
  },
  favoritesButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  favoritesBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E63946',
    borderRadius: Radius.full,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  favoritesBadgeText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: BrandColors.white,
  },
});
