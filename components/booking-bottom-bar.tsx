import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, ZIndex, TouchTarget } from '@/constants/design-tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface BookingBottomBarProps {
  price?: string;
  onInquire: () => void;
  hasAvailability?: boolean;
  isLoadingAvailability?: boolean;
}

export function BookingBottomBar({ price, onInquire, hasAvailability, isLoadingAvailability }: BookingBottomBarProps) {
  const insets = useSafeAreaInsets();

  // Clean up price - remove "From ", "per night", "/ night" and any trailing slashes
  const cleanPrice = price
    ?.replace('From ', '')
    ?.replace(/\s*(per night|\/\s*night)\s*$/i, '')
    ?.replace(/\s*\/\s*$/, '')
    ?.trim();

  return (
    <View style={[styles.container, {
      paddingBottom: Math.max(insets.bottom, Space[3])
    }]}>
      <View style={styles.content}>
        {/* Price & Availability */}
        <View style={styles.leftSection}>
          {cleanPrice && (
            <View style={styles.priceSection}>
              <Text style={styles.priceAmount}>{cleanPrice}</Text>
              <Text style={styles.priceUnit}> / night</Text>
            </View>
          )}
          {!isLoadingAvailability && hasAvailability !== undefined && (
            <View style={styles.availabilityIndicator}>
              <Feather
                name={hasAvailability ? "check-circle" : "calendar"}
                size={12}
                color={hasAvailability ? "#16a34a" : BrandColors.gray.medium}
              />
              <Text style={[
                styles.availabilityText,
                hasAvailability && styles.availabilityOpen
              ]}>
                {hasAvailability ? "Calendar open" : "Some dates booked"}
              </Text>
            </View>
          )}
        </View>

        {/* Inquire Button */}
        <Pressable style={styles.inquireButton} onPress={onInquire}>
          <Text style={styles.inquireText}>Inquire</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.select({ web: 'fixed', default: 'absolute' }) as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    paddingTop: Space[4],
    paddingHorizontal: Space[4],
    zIndex: ZIndex.sticky,
    ...Shadow.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space[4],
  },
  leftSection: {
    flex: 1,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  availabilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
    marginTop: 2,
  },
  availabilityText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
  },
  availabilityOpen: {
    color: '#16a34a',
  },
  priceAmount: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  priceUnit: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.normal,
    color: BrandColors.gray.dark,
  },
  inquireButton: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.md,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    minHeight: TouchTarget.min,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inquireText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
});
