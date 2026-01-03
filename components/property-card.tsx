import { StyleSheet, View, Text, Pressable, Image, Platform } from 'react-native';
import { useState, useCallback } from 'react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Rental } from '@/types/rental';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { getPropertyDataBySlug, PropertyData } from '@/data/property-data';
import { FavoritePromptModal } from './favorite-prompt-modal';
import { AmenityList } from './amenity-list';
import { useFavorites } from '@/hooks/use-favorites';

// Format price label based on asset category
function formatPriceLabel(propertyData: PropertyData | null): string {
  if (!propertyData?.displayPrice) return 'Price Upon Request';

  // Extract the numeric price from displayPrice (e.g., "From $500 USD per night" -> "$500")
  const priceMatch = propertyData.displayPrice.match(/\$[\d,]+(?:\.\d{2})?/);
  const priceAmount = priceMatch ? priceMatch[0] : propertyData.displayPrice;

  switch (propertyData.category) {
    case 'yacht':
      return `From ${priceAmount} / day`;
    case 'transport':
      return `From ${priceAmount} · route-based`;
    case 'villa':
    case 'property':
    case 'hotel':
    default:
      return `From ${priceAmount} / night`;
  }
}

interface PropertyCardProps {
  rental: Rental;
  onPress?: (rental: Rental) => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export function PropertyCard({ rental, onPress, isFavorite: isFavoriteProp, onFavoritePress }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();

  // Use prop if provided, otherwise check from hook
  const isFavorited = isFavoriteProp !== undefined ? isFavoriteProp : checkIsFavorite(rental.id);

  const locationParts = [rental.city?.name, rental.country?.name].filter(Boolean);
  const location = locationParts.join(', ');

  // Get real property data from Google Sheets
  const propertyData = getPropertyDataBySlug(rental.slug);

  const handleFavoriteClick = useCallback((e: any) => {
    e.stopPropagation();
    if (onFavoritePress) {
      // Use external handler if provided
      onFavoritePress();
    } else {
      // Use internal favorites logic
      toggleFavorite(rental.id, rental.slug);
    }
  }, [onFavoritePress, rental.id, rental.slug, toggleFavorite]);

  const handleEmailSubmit = async (email: string) => {
    // Save favorite after email capture
    await toggleFavorite(rental.id, rental.slug);
    setShowFavoriteModal(false);
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(rental)}
      // @ts-ignore - Web-only props
      onMouseEnter={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onMouseLeave={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
    >
      {/* Square Image Container */}
      <View style={styles.imageContainer}>
        {rental.featuredImage ? (
          <Image
            source={{ uri: rental.featuredImage.sizes.medium_large || rental.featuredImage.sizes.large || rental.featuredImage.url }}
            style={[
              styles.image,
              isHovered && Platform.OS === 'web' && styles.imageHovered,
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Wishlist button overlay */}
        <Pressable style={styles.wishlistButton} onPress={handleFavoriteClick}>
          <Ionicons
            name={isFavorited ? "heart" : "heart-outline"}
            size={20}
            color={isFavorited ? "#E63946" : BrandColors.black}
          />
        </Pressable>

        {/* Category badge */}
        {rental.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{rental.category.name}</Text>
          </View>
        )}
      </View>

      {/* Property Info */}
      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {rental.title.replace(' – Preview', '').replace(' &#8211; Preview', '')}
          </Text>
        </View>

        {location && (
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        )}

        {/* Property Details */}
        {propertyData && (
          <View style={styles.details}>
            {propertyData.guestMax && (
              <View style={styles.detailItem}>
                <Feather name="users" size={14} color={BrandColors.gray.medium} />
                <Text style={styles.detailText}>{propertyData.guestMax} guests</Text>
              </View>
            )}
            {propertyData.bedrooms && propertyData.category !== 'transport' && (
              <View style={styles.detailItem}>
                <Feather name="home" size={14} color={BrandColors.gray.medium} />
                <Text style={styles.detailText}>
                  {propertyData.bedrooms} {propertyData.category === 'yacht' ? (propertyData.bedrooms === 1 ? 'cabin' : 'cabins') : (propertyData.bedrooms === 1 ? 'bed' : 'beds')}
                </Text>
              </View>
            )}
            {propertyData.bathrooms && propertyData.category !== 'transport' && (
              <View style={styles.detailItem}>
                <Feather name="droplet" size={14} color={BrandColors.gray.medium} />
                <Text style={styles.detailText}>
                  {propertyData.bathrooms} {propertyData.bathrooms === 1 ? 'bath' : 'baths'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Select Amenities for Yachts/Transport */}
        {propertyData && (propertyData.category === 'yacht' || propertyData.category === 'transport') && propertyData.amenities && propertyData.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <AmenityList amenities={propertyData.amenities} maxDisplay={3} />
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricing}>
          <Text style={styles.price}>{formatPriceLabel(propertyData)}</Text>
        </View>
      </View>

      {/* Favorite Prompt Modal */}
      <FavoritePromptModal
        visible={showFavoriteModal}
        onClose={() => setShowFavoriteModal(false)}
        onSubmit={handleEmailSubmit}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    overflow: 'visible',
    marginBottom: Space[6],
    ...Shadow.base,
    ...Platform.select({
      web: {
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        // @ts-ignore - React Native Web supports hover
        ':hover': {
          transform: [{ translateY: -8 }, { scale: 1.02 }],
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 24,
        },
      },
    }),
  },
  cardPressed: {
    opacity: 0.95,
    ...Platform.select({
      web: {
        transform: [{ translateY: -4 }, { scale: 1.01 }],
      },
    }),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square!
    position: 'relative',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: {
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
  },
  imageHovered: {
    ...Platform.select({
      web: {
        transform: [{ scale: 1.08 }],
      },
    }),
  },
  imagePlaceholder: {
    backgroundColor: BrandColors.gray.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  wishlistButton: {
    position: 'absolute',
    top: Space[3],
    right: Space[3],
    width: 44, // Minimum touch target
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: Space[3],
    left: Space[3],
    backgroundColor: BrandColors.white,
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
    borderRadius: Radius.md,
  },
  categoryText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: {
    paddingTop: Space[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Space[1],
  },
  title: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    flex: 1,
  },
  location: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    marginBottom: Space[2],
  },
  details: {
    flexDirection: 'row',
    gap: Space[4],
    marginBottom: Space[2],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  detailText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  amenitiesContainer: {
    marginTop: Space[2],
    marginBottom: Space[2],
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Space[2],
  },
  price: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
});
