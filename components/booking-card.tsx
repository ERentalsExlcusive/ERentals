import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';
import { Feather } from '@expo/vector-icons';

interface BlockedRange {
  start: string;
  end: string;
  summary?: string;
}

interface BookingCardProps {
  price?: string;
  minStay?: number;
  onInquire: () => void;
  blockedRanges?: BlockedRange[];
  isLoadingAvailability?: boolean;
}

export function BookingCard({ price, minStay, onInquire, blockedRanges, isLoadingAvailability }: BookingCardProps) {
  // Clean up price - remove "From ", "per night", "/ night" and any trailing slashes
  const cleanPrice = price
    ?.replace('From ', '')
    ?.replace(/\s*(per night|\/\s*night)\s*$/i, '')
    ?.replace(/\s*\/\s*$/, '')
    ?.trim();

  return (
    <View style={styles.card}>
      {/* Price */}
      {cleanPrice && (
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>{cleanPrice}</Text>
            <Text style={styles.priceUnit}> / night</Text>
          </View>
          {minStay && (
            <Text style={styles.minStay}>{minStay} night minimum</Text>
          )}
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Inquire Button */}
      <Pressable style={styles.inquireButton} onPress={onInquire}>
        <Text style={styles.inquireText}>Request to Book</Text>
      </Pressable>

      {/* Footer */}
      <Text style={styles.footer}>You won't be charged yet</Text>

      {/* Availability Status */}
      {isLoadingAvailability && (
        <View style={styles.availabilitySection}>
          <Feather name="loader" size={14} color={BrandColors.gray.medium} />
          <Text style={styles.availabilityLoading}>Checking availability...</Text>
        </View>
      )}
      {!isLoadingAvailability && blockedRanges && blockedRanges.length > 0 && (
        <View style={styles.availabilitySection}>
          <Feather name="calendar" size={14} color={BrandColors.gray.dark} />
          <Text style={styles.availabilityText}>
            {blockedRanges.length} period{blockedRanges.length > 1 ? 's' : ''} booked
          </Text>
        </View>
      )}
      {!isLoadingAvailability && blockedRanges && blockedRanges.length === 0 && (
        <View style={styles.availabilitySection}>
          <Feather name="check-circle" size={14} color="#16a34a" />
          <Text style={styles.availabilityAvailable}>Calendar open</Text>
        </View>
      )}

      {/* Contact */}
      <View style={styles.contactSection}>
        <Pressable style={styles.contactButton} onPress={onInquire}>
          <Feather name="message-circle" size={16} color={BrandColors.black} />
          <Text style={styles.contactText}>Contact concierge</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.xl,
    padding: Space[6],
    ...Shadow.base,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 96,
      },
    }),
  },
  priceSection: {
    marginBottom: Space[5],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Space[1],
  },
  priceAmount: {
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    letterSpacing: -0.8,
  },
  priceUnit: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.normal,
    color: BrandColors.gray.dark,
  },
  minStay: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.gray.border,
    marginVertical: Space[5],
  },
  inquireButton: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.md,
    paddingVertical: Space[4],
    alignItems: 'center',
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  inquireText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
    letterSpacing: 0.2,
  },
  footer: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginTop: Space[4],
  },
  contactSection: {
    marginTop: Space[5],
    paddingTop: Space[5],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    paddingVertical: Space[3],
  },
  contactText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  availabilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[2],
    marginTop: Space[4],
    paddingTop: Space[4],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
  },
  availabilityLoading: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    fontStyle: 'italic',
  },
  availabilityText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  availabilityAvailable: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: '#16a34a',
    fontWeight: FontWeight.medium,
  },
});
