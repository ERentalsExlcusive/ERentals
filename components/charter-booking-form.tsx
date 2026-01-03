import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';
import { DatePicker } from './date-picker';
import { BottomSheet } from './bottom-sheet';
import { useResponsive } from '@/hooks/use-responsive';

interface CharterBookingFormProps {
  propertyName: string;
  propertyCategory: 'yacht' | 'transport';
  displayPrice?: string;
  maxGuests?: number;
  onSubmit: (booking: CharterBookingData) => void;
  isSubmitting?: boolean;
}

export interface CharterBookingData {
  date: Date;
  duration: string;
  departureTime: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  occasion?: string;
  notes?: string;
  // Transport-specific fields
  pickup?: string;
  dropoff?: string;
}

// Charter duration options
const YACHT_DURATIONS = [
  { value: '4hr', label: '4 Hours', description: 'Half-day cruise' },
  { value: '6hr', label: '6 Hours', description: 'Extended cruise' },
  { value: '8hr', label: '8 Hours', description: 'Full day' },
  { value: 'overnight', label: 'Overnight', description: 'Multi-day charter' },
];

const TRANSPORT_DURATIONS = [
  { value: '4hr', label: '4 Hours', description: 'Half-day transfer' },
  { value: '8hr', label: '8 Hours', description: 'Full day' },
  { value: 'daily', label: 'Daily', description: 'Per day rental' },
  { value: 'transfer', label: 'One-way', description: 'Airport/point-to-point' },
];

// Departure time options grouped by period
const TIME_PERIODS = [
  {
    period: 'Morning',
    times: [
      { value: '08:00', label: '8:00 AM' },
      { value: '09:00', label: '9:00 AM' },
      { value: '10:00', label: '10:00 AM' },
      { value: '11:00', label: '11:00 AM' },
    ],
  },
  {
    period: 'Afternoon',
    times: [
      { value: '12:00', label: '12:00 PM' },
      { value: '13:00', label: '1:00 PM' },
      { value: '14:00', label: '2:00 PM' },
      { value: '15:00', label: '3:00 PM' },
    ],
  },
  {
    period: 'Sunset',
    times: [
      { value: '16:00', label: '4:00 PM' },
      { value: '17:00', label: '5:00 PM' },
    ],
  },
  {
    period: 'Evening',
    times: [
      { value: '18:00', label: '6:00 PM' },
    ],
  },
];

// Flat list for getTimeLabel lookup
const ALL_TIMES = TIME_PERIODS.flatMap(p => p.times);

// Yacht occasions (NOT for transport)
const YACHT_OCCASIONS = [
  { value: 'celebration', label: 'Birthday/Celebration', icon: 'gift' },
  { value: 'corporate', label: 'Corporate Event', icon: 'briefcase' },
  { value: 'wedding', label: 'Wedding Party', icon: 'heart' },
  { value: 'sunset', label: 'Sunset Cruise', icon: 'sun' },
  { value: 'fishing', label: 'Fishing Trip', icon: 'anchor' },
  { value: 'leisure', label: 'Leisure', icon: 'smile' },
];

// Extract just the dollar amount from displayPrice (remove all units/text)
function cleanPriceAmount(price?: string): string | null {
  if (!price) return null;
  // Match the dollar amount: $1,234 or $1,234.56
  const match = price.match(/\$[\d,]+(?:\.\d{2})?/);
  return match ? match[0] : null;
}

// Get clean price label based on category
function getPriceLabel(category: 'yacht' | 'transport'): string {
  return category === 'yacht' ? 'per charter' : 'route-based pricing';
}

export function CharterBookingForm({
  propertyName,
  propertyCategory,
  displayPrice,
  maxGuests = 10,
  onSubmit,
  isSubmitting = false,
}: CharterBookingFormProps) {
  const { isMobile } = useResponsive();
  const durations = propertyCategory === 'yacht' ? YACHT_DURATIONS : TRANSPORT_DURATIONS;

  const isYacht = propertyCategory === 'yacht';
  const isTransport = propertyCategory === 'transport';

  // Clean price - extract just the dollar amount
  const cleanPrice = cleanPriceAmount(displayPrice);

  // Form state
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [occasion, setOccasion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  // Transport-specific
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Validation - different for yacht vs transport
  const isValid = useMemo(() => {
    const hasContactInfo = name.trim() && email.includes('@') && phone.length >= 10;

    if (isTransport) {
      // Transport: pickup, dropoff, date, time, passengers
      return hasContactInfo && date && departureTime && pickup.trim() && dropoff.trim();
    } else {
      // Yacht: charter_date, departure_time, duration, guests
      return hasContactInfo && date && duration && departureTime;
    }
  }, [date, duration, departureTime, name, email, phone, isTransport, pickup, dropoff]);

  const handleSubmit = () => {
    if (!isValid || !date) return;

    onSubmit({
      date,
      duration: isTransport ? 'transfer' : duration,
      departureTime,
      guests,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      occasion: isYacht ? (occasion || undefined) : undefined,
      notes: notes.trim() || undefined,
      // Transport-specific
      pickup: isTransport ? pickup.trim() : undefined,
      dropoff: isTransport ? dropoff.trim() : undefined,
    });
  };

  const formatDate = (d: Date | null) => {
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTimeLabel = (value: string) => {
    return ALL_TIMES.find(t => t.value === value)?.label || 'Select time';
  };

  const getDurationLabel = (value: string) => {
    return durations.find(d => d.value === value)?.label || '';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Price Header - Clean amount + category-specific label */}
      {cleanPrice && (
        <View style={styles.priceHeader}>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{cleanPrice}</Text>
            <Text style={styles.priceUnit}> {getPriceLabel(propertyCategory)}</Text>
          </View>
        </View>
      )}

      {/* Transport: Pickup & Dropoff */}
      {isTransport && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Transfer Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Location *</Text>
            <TextInput
              style={styles.input}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Airport, hotel, address..."
              placeholderTextColor={BrandColors.gray.medium}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dropoff Location *</Text>
            <TextInput
              style={styles.input}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="Destination address..."
              placeholderTextColor={BrandColors.gray.medium}
            />
          </View>
        </View>
      )}

      {/* Yacht: Duration Selection (NOT for transport) */}
      {isYacht && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Charter Duration</Text>
          <View style={styles.durationGrid}>
            {durations.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.durationCard,
                  duration === d.value && styles.durationCardActive
                ]}
                activeOpacity={0.7}
                onPress={() => setDuration(d.value)}
              >
                <Text style={[
                  styles.durationLabel,
                  duration === d.value && styles.durationLabelActive
                ]}>
                  {d.label}
                </Text>
                <Text style={[
                  styles.durationDesc,
                  duration === d.value && styles.durationDescActive
                ]}>
                  {d.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Date & Time Row */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{isTransport ? 'Pickup Date & Time' : 'Charter Date & Time'}</Text>
        <View style={styles.dateTimeRow}>
          {/* Date Picker */}
          <Pressable
            style={[styles.dateTimeField, date && styles.dateTimeFieldFilled]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={18} color={date ? BrandColors.black : BrandColors.gray.medium} />
            <Text style={[styles.dateTimeText, !date && styles.dateTimeTextPlaceholder]}>
              {formatDate(date)}
            </Text>
          </Pressable>

          {/* Time Picker */}
          <Pressable
            style={[styles.dateTimeField, departureTime && styles.dateTimeFieldFilled]}
            onPress={() => setShowTimePicker(true)}
          >
            <Feather name="clock" size={18} color={departureTime ? BrandColors.black : BrandColors.gray.medium} />
            <Text style={[styles.dateTimeText, !departureTime && styles.dateTimeTextPlaceholder]}>
              {getTimeLabel(departureTime)}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Guests / Passengers */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{isTransport ? 'Number of Passengers' : 'Number of Guests'}</Text>
        <View style={styles.guestRow}>
          <Pressable
            style={[styles.guestButton, guests <= 1 && styles.guestButtonDisabled]}
            onPress={() => setGuests(Math.max(1, guests - 1))}
            disabled={guests <= 1}
          >
            <Feather name="minus" size={20} color={guests <= 1 ? BrandColors.gray.border : BrandColors.gray.dark} />
          </Pressable>
          <View style={styles.guestDisplay}>
            <Text style={styles.guestCount}>{guests}</Text>
            <Text style={styles.guestLabel}>{isTransport ? 'passengers' : 'guests'}</Text>
          </View>
          <Pressable
            style={[styles.guestButton, guests >= maxGuests && styles.guestButtonDisabled]}
            onPress={() => setGuests(Math.min(maxGuests, guests + 1))}
            disabled={guests >= maxGuests}
          >
            <Feather name="plus" size={20} color={guests >= maxGuests ? BrandColors.gray.border : BrandColors.gray.dark} />
          </Pressable>
        </View>
        <Text style={styles.guestMax}>Maximum {maxGuests} {isTransport ? 'passengers' : 'guests'}</Text>
      </View>

      {/* Occasion (Optional) - YACHT ONLY, NOT for transport */}
      {isYacht && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Occasion (Optional)</Text>
          <View style={styles.occasionGrid}>
            {YACHT_OCCASIONS.map((occ) => (
              <TouchableOpacity
                key={occ.value}
                style={[
                  styles.occasionChip,
                  occasion === occ.value && styles.occasionChipActive
                ]}
                activeOpacity={0.7}
                onPress={() => setOccasion(occasion === occ.value ? '' : occ.value)}
              >
                <Feather
                  name={occ.icon as any}
                  size={14}
                  color={occasion === occ.value ? BrandColors.white : BrandColors.gray.dark}
                />
                <Text style={[
                  styles.occasionText,
                  occasion === occ.value && styles.occasionTextActive
                ]}>
                  {occ.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Contact Details */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Contact Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={BrandColors.gray.medium}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={BrandColors.gray.medium}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={BrandColors.gray.medium}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Special Requests</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={notes}
            onChangeText={setNotes}
            placeholder={isTransport
              ? "Stops, luggage requirements, special instructions..."
              : "Dietary needs, special arrangements..."}
            placeholderTextColor={BrandColors.gray.medium}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Summary */}
      {date && (isTransport ? (pickup && dropoff) : duration) && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{propertyName}</Text>
          </View>
          {isTransport && pickup && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup</Text>
              <Text style={styles.summaryValue}>{pickup}</Text>
            </View>
          )}
          {isTransport && dropoff && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dropoff</Text>
              <Text style={styles.summaryValue}>{dropoff}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isTransport ? 'Pickup Date' : 'Charter Date'}</Text>
            <Text style={styles.summaryValue}>{formatDate(date)}</Text>
          </View>
          {isYacht && duration && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{getDurationLabel(duration)}</Text>
            </View>
          )}
          {departureTime && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{isTransport ? 'Pickup Time' : 'Departure'}</Text>
              <Text style={styles.summaryValue}>{getTimeLabel(departureTime)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{isTransport ? 'Passengers' : 'Guests'}</Text>
            <Text style={styles.summaryValue}>{guests}</Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <Pressable
        style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid || isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Sending...' : (isTransport ? 'Request Transfer' : 'Request Charter')}
        </Text>
      </Pressable>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        By submitting, you agree to our booking terms. Our concierge team will confirm availability within 24 hours.
      </Text>

      {/* Date Picker Modal */}
      <BottomSheet
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        title="Select Charter Date"
        scrollEnabled={false}
      >
        <DatePicker
          startDate={date || undefined}
          endDate={date || undefined}
          onDatesChange={(start) => {
            if (start) {
              setDate(start);
              setShowDatePicker(false);
            }
          }}
          minDate={new Date()}
        />
      </BottomSheet>

      {/* Time Picker Modal */}
      <BottomSheet
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        title="Departure Time"
      >
        <View style={styles.timePickerContainer}>
          {TIME_PERIODS.map((periodGroup) => (
            <View key={periodGroup.period} style={styles.timePeriodSection}>
              {/* Full-width section label */}
              <Text style={styles.timePeriodLabel}>{periodGroup.period}</Text>

              {/* Grid of time buttons */}
              <View style={styles.timeButtonGrid}>
                {periodGroup.times.map((time) => (
                  <TouchableOpacity
                    key={time.value}
                    style={[
                      styles.timeButton,
                      departureTime === time.value && styles.timeButtonActive
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setDepartureTime(time.value);
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.timeButtonText,
                      departureTime === time.value && styles.timeButtonTextActive
                    ]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Space[6],
    paddingTop: Space[6],
    paddingBottom: Space[10], // Extra bottom padding for safe area
  },
  priceHeader: {
    marginBottom: Space[6],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  priceText: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
  },
  priceUnit: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.normal,
    color: BrandColors.gray.dark,
  },
  section: {
    marginBottom: Space[6],
  },
  sectionLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Space[3],
  },

  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[3],
  },
  durationCard: {
    width: Platform.select({ web: 'calc(50% - 6px)', default: '47%' }) as any,
    paddingVertical: Space[4],
    paddingHorizontal: Space[3],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
  },
  durationCardActive: {
    borderColor: BrandColors.black,
    backgroundColor: BrandColors.black,
  },
  durationLabel: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  durationLabelActive: {
    color: BrandColors.white,
  },
  durationDesc: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  durationDescActive: {
    color: 'rgba(255,255,255,0.7)',
  },

  // Date & Time
  dateTimeRow: {
    flexDirection: 'row',
    gap: Space[3],
  },
  dateTimeField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
  },
  dateTimeFieldFilled: {
    borderColor: BrandColors.black,
  },
  dateTimeText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  dateTimeTextPlaceholder: {
    color: BrandColors.gray.medium,
  },

  // Guests
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[6],
    paddingVertical: Space[4],
  },
  guestButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonDisabled: {
    borderColor: BrandColors.gray.light,
    backgroundColor: BrandColors.gray.light,
  },
  guestDisplay: {
    alignItems: 'center',
    minWidth: 80,
  },
  guestCount: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
  },
  guestLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  guestMax: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginTop: Space[2],
  },

  // Occasion
  occasionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.gray.light,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  occasionChipActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  occasionText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  occasionTextActive: {
    color: BrandColors.white,
  },

  // Inputs
  inputGroup: {
    marginBottom: Space[4],
  },
  inputLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
    marginBottom: Space[2],
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.lg,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.black,
    backgroundColor: BrandColors.white,
    minHeight: TouchTarget.min,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Space[3],
  },

  // Summary
  summary: {
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.lg,
    padding: Space[4],
    marginBottom: Space[6],
  },
  summaryTitle: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[3],
    paddingBottom: Space[2],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space[2],
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  summaryValue: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },

  // Submit
  submitButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[4],
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.comfortable,
    marginBottom: Space[4],
  },
  submitButtonDisabled: {
    backgroundColor: BrandColors.gray.medium,
  },
  submitButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[8],
  },

  // Time Picker - Grouped sections with responsive grid
  timePickerContainer: {
    gap: Space[5],
  },
  timePeriodSection: {
    width: '100%',
  },
  timePeriodLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Space[3],
    width: '100%',
  },
  timeButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  timeButton: {
    // Fixed width: 4 columns with gap accounting
    width: Platform.select({ web: 'calc(25% - 6px)', default: '23%' }) as any,
    height: TouchTarget.min,
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.gray.light,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  timeButtonText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  timeButtonTextActive: {
    color: BrandColors.white,
  },
});
