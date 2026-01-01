import { StyleSheet, View, Text, Pressable, Image, Platform } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Rental } from '@/types/rental';
import { BrandColors, Spacing } from '@/constants/theme';
import { getPropertyDataBySlug } from '@/data/property-data';
import { FavoritePromptModal } from './favorite-prompt-modal';
import { AmenityList } from './amenity-list';

interface PropertyCardProps {
  rental: Rental;
  onPress?: (rental: Rental) => void;
}

export function PropertyCard({ rental, onPress }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const locationParts = [rental.city?.name, rental.country?.name].filter(Boolean);
  const location = locationParts.join(', ');

  // Get real property data from Google Sheets
  const propertyData = getPropertyDataBySlug(rental.slug);

  const handleFavoriteClick = (e: any) => {
    e.stopPropagation();
    if (!isFavorited) {
      setShowFavoriteModal(true);
    } else {
      setIsFavorited(false);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    // TODO: Save email and favorite to backend/local storage
    console.log('User email:', email, 'Property:', rental.slug);
    setIsFavorited(true);
    setShowFavoriteModal(false);
    // In production, you would save this to a backend or local storage
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
          <Feather
            name={isFavorited ? "heart" : "heart"}
            size={18}
            color={isFavorited ? "#E63946" : BrandColors.black}
            fill={isFavorited ? "#E63946" : "none"}
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
          <Text style={styles.price}>{propertyData?.displayPrice || 'Price Upon Request'}</Text>
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
    borderRadius: 12,
    overflow: 'visible',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
    borderRadius: 12,
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
    fontSize: 14,
    color: BrandColors.gray.medium,
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: {
    paddingTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.black,
    flex: 1,
  },
  location: {
    fontSize: 14,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.xs,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: BrandColors.gray.medium,
  },
  amenitiesContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.xs,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.black,
  },
});
