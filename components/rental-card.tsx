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
      {/* Image */}
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

      {/* Content below image */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
          </Text>
          {rental.category && (
            <Text style={styles.category}>{rental.category.name}</Text>
          )}
        </View>

        {location && (
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        )}

        {/* Pricing placeholder - can be populated from ACF fields */}
        <View style={styles.footer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.price}>Contact for pricing</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  cardPressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: 240,
  },
  imagePlaceholder: {
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: BrandColors.gray.medium,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.black,
    flex: 1,
    marginRight: Spacing.sm,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 14,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  priceLabel: {
    fontSize: 13,
    color: BrandColors.gray.medium,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.black,
  },
});
