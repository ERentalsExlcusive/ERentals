import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BrandColors, Typography, Spacing } from '@/constants/theme';

export interface NavigationHeaderProps {
  variant?: 'transparent' | 'solid';
  showSearch?: boolean;
  onSearchPress?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Collections', path: '/collections' },
  { label: 'List Your Asset', path: '/list-asset' },
  { label: 'Collaborate', path: '/collaborate' },
  { label: 'Blog', path: '/blog' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact Us', path: '/contact' },
];

export function NavigationHeader({
  variant = 'solid',
  showSearch = true,
  onSearchPress,
}: NavigationHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuPress = (path: string) => {
    router.push(path as any);
  };

  const handleLogoPress = () => {
    router.push('/');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'transparent' ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.content}>
        {/* Logo */}
        <Pressable
          style={({ pressed }) => [
            styles.logo,
            pressed && styles.logoPressed,
          ]}
          onPress={handleLogoPress}
        >
          <Text style={styles.logoText}>ERentals</Text>
          <Text style={styles.logoTagline}>EXCLUSIVE</Text>
        </Pressable>

        {/* Navigation Menu */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuContainer}
          style={styles.menuScroll}
        >
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.path}
              style={({ pressed }) => [
                styles.menuItem,
                isActive(item.path) && styles.menuItemActive,
                pressed && styles.menuItemPressed,
              ]}
              onPress={() => handleMenuPress(item.path)}
            >
              <Text
                style={[
                  styles.menuItemText,
                  isActive(item.path) && styles.menuItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search Button */}
        {showSearch && onSearchPress && (
          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.searchButtonPressed,
            ]}
            onPress={onSearchPress}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.light,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 0,
  },
  solid: {
    backgroundColor: BrandColors.white,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  logo: {
    alignItems: 'center',
    paddingRight: Spacing.md,
  },
  logoPressed: {
    opacity: 0.7,
  },
  logoText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: BrandColors.primary,
    letterSpacing: 1,
  },
  logoTagline: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 10,
    color: BrandColors.secondary,
    letterSpacing: 4,
    marginTop: -4,
  },
  menuScroll: {
    flex: 1,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  menuItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
  },
  menuItemActive: {
    backgroundColor: BrandColors.gray.light,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuItemText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: BrandColors.gray.dark,
    letterSpacing: 0.5,
  },
  menuItemTextActive: {
    color: BrandColors.primary,
  },
  searchButton: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  searchButtonPressed: {
    backgroundColor: BrandColors.primary,
  },
  searchButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: BrandColors.white,
    letterSpacing: 1,
  },
});
