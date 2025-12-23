import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { Rental } from '@/types/rental';
import { BrandColors, Typography, Spacing } from '@/constants/theme';

interface RentalCardProps {
  rental: Rental;
  onPress?: (rental: Rental) => void;
}

export function RentalCard({ rental, onPress }: RentalCardProps) {
  const locationParts = [rental.city?.name, rental.country?.name].filter(Boolean);
  const location = locationParts.join(', ');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(rental)}
    >
      {rental.featuredImage ? (
        <Image
          source={{ uri: rental.featuredImage.sizes.large || rental.featuredImage.url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      <View style={styles.overlay} />

      <View style={styles.content}>
        {rental.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{rental.category.name}</Text>
          </View>
        )}

        <Text style={styles.title} numberOfLines={2}>
          {rental.title.replace(' – Preview', '')}
        </Text>

        {location && (
          <Text style={styles.location}>{location}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: BrandColors.gray.light,
    marginBottom: Spacing.md,
    height: 280,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  imagePlaceholder: {
    backgroundColor: BrandColors.gray.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  categoryBadge: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  categoryText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 12,
    color: BrandColors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: BrandColors.white,
    marginBottom: 4,
  },
  location: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: BrandColors.gray.light,
  },
});
