import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors, Spacing } from '@/constants/theme';

interface HeaderProps {
  onCategorySelect?: (category: 'villa' | 'yacht' | 'transport') => void;
}

export function Header({ onCategorySelect }: HeaderProps = {}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        {/* Logo */}
        <Pressable onPress={() => router.push('/')} style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://erentalsexclusive.com/wp-content/uploads/2025/06/ere.png' }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Pressable>

        {/* Navigation */}
        <View style={styles.nav}>
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

        {/* Right side - empty for now, keeping minimal */}
        <View style={styles.rightSide} />
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
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    maxWidth: 1400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logoContainer: {
    height: 40,
    justifyContent: 'center',
  },
  logoImage: {
    width: 50,
    height: 40,
  },
  nav: {
    flexDirection: 'row',
    gap: Spacing.lg,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  navLink: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.white,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rightSide: {
    width: 50,
  },
});
