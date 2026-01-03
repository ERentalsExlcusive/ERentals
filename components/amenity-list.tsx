import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';

interface AmenityListProps {
  amenities: string[];
  maxDisplay?: number;
}

// Map common amenity keywords to icons
const getAmenityIcon = (amenity: string): keyof typeof Feather.glyphMap => {
  const lower = amenity.toLowerCase();

  if (lower.includes('pool') || lower.includes('jacuzzi')) return 'droplet';
  if (lower.includes('wifi') || lower.includes('wi-fi') || lower.includes('starlink')) return 'wifi';
  if (lower.includes('beach') || lower.includes('ocean') || lower.includes('sea')) return 'sun';
  if (lower.includes('kitchen')) return 'coffee';
  if (lower.includes('parking')) return 'box';
  if (lower.includes('gym') || lower.includes('fitness')) return 'activity';
  if (lower.includes('air conditioning') || lower.includes('a/c')) return 'wind';
  if (lower.includes('garden') || lower.includes('terrace') || lower.includes('rooftop')) return 'home';
  if (lower.includes('chef') || lower.includes('staff') || lower.includes('concierge')) return 'user';
  if (lower.includes('security') || lower.includes('gated')) return 'shield';
  if (lower.includes('view')) return 'eye';
  if (lower.includes('private') || lower.includes('exclusive')) return 'lock';

  return 'check';
};

export function AmenityList({ amenities, maxDisplay = 6 }: AmenityListProps) {
  const displayedAmenities = amenities.slice(0, maxDisplay);
  const remainingCount = amenities.length - maxDisplay;

  return (
    <View style={styles.container}>
      {displayedAmenities.map((amenity, index) => (
        <View key={index} style={styles.amenityItem}>
          <Feather
            name={getAmenityIcon(amenity)}
            size={16}
            color={BrandColors.gray.dark}
          />
          <Text style={styles.amenityText}>{amenity}</Text>
        </View>
      ))}
      {remainingCount > 0 && (
        <View style={styles.amenityItem}>
          <Text style={styles.moreText}>+{remainingCount} more</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
    marginTop: Space[2],
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.md,
  },
  amenityText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.dark,
    fontWeight: FontWeight.medium,
  },
  moreText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.semibold,
  },
});
