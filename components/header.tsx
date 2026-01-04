import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, ZIndex } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/context/auth-context';
import { AuthModal } from './auth-modal';

interface HeaderProps {
  onCategorySelect?: (category: 'villa' | 'yacht' | 'transport') => void;
  onHomePress?: () => void;
}

export function Header({ onCategorySelect, onHomePress }: HeaderProps = {}) {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { favoritesCount } = useFavorites();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      router.push('/');
    }
  };

  const handleUserPress = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      setShowAuthModal(true);
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

        {/* Right side - Favorites, User & Owner Portal */}
        <View style={styles.rightSection}>
          <Pressable style={styles.favoritesButton} onPress={() => router.push('/favorites')}>
            <Feather name="heart" size={20} color={BrandColors.black} />
            {favoritesCount > 0 && (
              <View style={styles.favoritesBadge}>
                <Text style={styles.favoritesBadgeText}>{favoritesCount > 9 ? '9+' : favoritesCount}</Text>
              </View>
            )}
          </Pressable>

          {/* User Button */}
          <View style={styles.userButtonContainer}>
            <Pressable style={styles.userButton} onPress={handleUserPress}>
              {isAuthenticated ? (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </Text>
                </View>
              ) : (
                <Feather name="user" size={20} color={BrandColors.black} />
              )}
            </Pressable>

            {/* User Dropdown Menu */}
            {showUserMenu && isAuthenticated && (
              <>
                {/* Invisible backdrop to close menu when clicking outside */}
                <Pressable
                  style={styles.menuBackdrop}
                  onPress={() => setShowUserMenu(false)}
                />
                <View style={styles.userMenu}>
                  <Text style={styles.userMenuEmail}>{user?.email}</Text>
                  <View style={styles.userMenuDivider} />
                  <Pressable style={styles.userMenuItem} onPress={() => { router.push('/favorites'); setShowUserMenu(false); }}>
                    <Feather name="heart" size={16} color={BrandColors.gray.dark} />
                    <Text style={styles.userMenuItemText}>Saved Listings</Text>
                  </Pressable>
                  <Pressable style={styles.userMenuItem} onPress={() => { signOut(); setShowUserMenu(false); }}>
                    <Feather name="log-out" size={16} color={BrandColors.gray.dark} />
                    <Text style={styles.userMenuItemText}>Sign Out</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <Pressable style={[styles.ownerPortal, isMobile && styles.ownerPortalMobile]} onPress={() => router.push('/owner-portal')}>
            <Text style={[styles.ownerPortalText, isMobile && styles.ownerPortalTextMobile]}>Owner Portal</Text>
          </Pressable>
        </View>
      </View>

      {/* Auth Modal */}
      <AuthModal visible={showAuthModal} onClose={() => setShowAuthModal(false)} />
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
  userButtonContainer: {
    position: 'relative',
  },
  userButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandColors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  menuBackdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: ZIndex.dropdown - 1,
  },
  userMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    padding: Space[2],
    minWidth: 200,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
    }),
    zIndex: ZIndex.dropdown,
  },
  userMenuEmail: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
  },
  userMenuDivider: {
    height: 1,
    backgroundColor: BrandColors.gray.border,
    marginVertical: Space[2],
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingHorizontal: Space[3],
    paddingVertical: Space[3],
    borderRadius: Radius.md,
  },
  userMenuItemText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.black,
  },
});
