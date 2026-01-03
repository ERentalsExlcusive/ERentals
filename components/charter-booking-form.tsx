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

// Departure time options
const DEPARTURE_TIMES = [
  { value: '08:00', label: '8:00 AM', period: 'Morning' },
  { value: '09:00', label: '9:00 AM', period: 'Morning' },
  { value: '10:00', label: '10:00 AM', period: 'Morning' },
  { value: '11:00', label: '11:00 AM', period: 'Morning' },
  { value: '12:00', label: '12:00 PM', period: 'Afternoon' },
  { value: '13:00', label: '1:00 PM', period: 'Afternoon' },
  { value: '14:00', label: '2:00 PM', period: 'Afternoon' },
  { value: '15:00', label: '3:00 PM', period: 'Afternoon' },
  { value: '16:00', label: '4:00 PM', period: 'Sunset' },
  { value: '17:00', label: '5:00 PM', period: 'Sunset' },
  { value: '18:00', label: '6:00 PM', period: 'Evening' },
];

// Charter occasions
const CHARTER_OCCASIONS = [
  { value: 'celebration', label: 'Birthday/Celebration', icon: 'gift' },
  { value: 'corporate', label: 'Corporate Event', icon: 'briefcase' },
  { value: 'wedding', label: 'Wedding Party', icon: 'heart' },
  { value: 'sunset', label: 'Sunset Cruise', icon: 'sun' },
  { value: 'fishing', label: 'Fishing Trip', icon: 'anchor' },
  { value: 'leisure', label: 'Leisure', icon: 'smile' },
];

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

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  // Validation
  const isValid = useMemo(() => {
    return date && duration && departureTime && name.trim() && email.includes('@') && phone.length >= 10;
  }, [date, duration, departureTime, name, email, phone]);

  const handleSubmit = () => {
    if (!isValid || !date) return;

    onSubmit({
      date,
      duration,
      departureTime,
      guests,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      occasion: occasion || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const formatDate = (d: Date | null) => {
    if (!d) return 'Select date';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTimeLabel = (value: string) => {
    return DEPARTURE_TIMES.find(t => t.value === value)?.label || 'Select time';
  };

  const getDurationLabel = (value: string) => {
    return durations.find(d => d.value === value)?.label || '';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Price Header */}
      {displayPrice && (
        <View style={styles.priceHeader}>
          <Text style={styles.priceText}>{displayPrice}</Text>
          <Text style={styles.priceNote}>
            {propertyCategory === 'yacht' ? 'per charter' : 'per day'}
          </Text>
        </View>
      )}

      {/* Duration Selection */}
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

      {/* Date & Time Row */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Date & Departure Time</Text>
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

      {/* Guests */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Number of Guests</Text>
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
            <Text style={styles.guestLabel}>guests</Text>
          </View>
          <Pressable
            style={[styles.guestButton, guests >= maxGuests && styles.guestButtonDisabled]}
            onPress={() => setGuests(Math.min(maxGuests, guests + 1))}
            disabled={guests >= maxGuests}
          >
            <Feather name="plus" size={20} color={guests >= maxGuests ? BrandColors.gray.border : BrandColors.gray.dark} />
          </Pressable>
        </View>
        <Text style={styles.guestMax}>Maximum {maxGuests} guests</Text>
      </View>

      {/* Occasion (Optional) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Occasion (Optional)</Text>
        <View style={styles.occasionGrid}>
          {CHARTER_OCCASIONS.map((occ) => (
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
            placeholder="Dietary needs, special arrangements..."
            placeholderTextColor={BrandColors.gray.medium}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Summary */}
      {duration && date && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{propertyName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formatDate(date)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{getDurationLabel(duration)}</Text>
          </View>
          {departureTime && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Departure</Text>
              <Text style={styles.summaryValue}>{getTimeLabel(departureTime)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
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
          {isSubmitting ? 'Sending...' : 'Request Charter'}
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
        <View style={styles.timeGrid}>
          {DEPARTURE_TIMES.map((time, index) => {
            const prevPeriod = index > 0 ? DEPARTURE_TIMES[index - 1].period : null;
            const showPeriodLabel = time.period !== prevPeriod;

            return (
              <View key={time.value} style={styles.timeItem}>
                {showPeriodLabel && (
                  <Text style={styles.timePeriodLabel}>{time.period}</Text>
                )}
                <TouchableOpacity
                  style={[
                    styles.timeChip,
                    departureTime === time.value && styles.timeChipActive
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDepartureTime(time.value);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={[
                    styles.timeChipText,
                    departureTime === time.value && styles.timeChipTextActive
                  ]}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </BottomSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  priceHeader: {
    marginBottom: Space[6],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  priceText: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
  },
  priceNote: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
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
    gap: Space[2],
  },
  durationCard: {
    width: '48%',
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
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

  // Time Picker
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  timeItem: {
    width: '30%',
  },
  timePeriodLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    marginBottom: Space[2],
    marginTop: Space[3],
  },
  timeChip: {
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    borderRadius: Radius.lg,
    backgroundColor: BrandColors.gray.light,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    alignItems: 'center',
  },
  timeChipActive: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  timeChipText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  timeChipTextActive: {
    color: BrandColors.white,
  },
});
