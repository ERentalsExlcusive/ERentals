import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';
import { DatePicker } from './date-picker';

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  er_id?: string;
  creator_id?: string;
}

interface BookingInquiryFormProps {
  propertyName: string;
  propertyId: number;
  price?: string;
  nightlyRate?: number; // Numeric nightly rate for calculations
  checkIn?: Date | null;
  checkOut?: Date | null;
  guests?: number;
  minStayNights?: number;
  blockedDates?: Set<string>;
  attribution?: Attribution;
  onClose: () => void;
  onSuccess: (hasWebhookWarning?: boolean) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferWhatsApp: boolean;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export function BookingInquiryForm({
  propertyName,
  propertyId,
  price,
  nightlyRate,
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  guests: initialGuests,
  minStayNights,
  blockedDates,
  attribution,
  onClose,
  onSuccess,
}: BookingInquiryFormProps) {
  // Booking details state - editable within the form
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut || null);
  const [guests, setGuests] = useState(initialGuests || 2);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferWhatsApp: true,
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculate nights and price
  const priceCalculation = useMemo(() => {
    if (!checkIn || !checkOut) return null;

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay);

    if (nights <= 0) return null;

    // If we have a numeric nightlyRate, calculate total
    if (nightlyRate && nightlyRate > 0) {
      const subtotal = nightlyRate * nights;
      return {
        nights,
        nightlyRate,
        subtotal,
        total: subtotal, // Could add fees here if needed
      };
    }

    // Just return nights if no rate available
    return { nights, nightlyRate: null, subtotal: null, total: null };
  }, [checkIn, checkOut, nightlyRate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDatesChange = (start: Date | null, end: Date | null) => {
    setCheckIn(start);
    setCheckOut(end);
    // Close picker when both dates selected
    if (start && end) {
      setShowDatePicker(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Flexible';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare payload for /api/inquiry endpoint
      const payload = {
        // Contact info
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        preferWhatsApp: formData.preferWhatsApp,

        // Property info
        propertyName,
        propertyId,
        propertyCategory: 'villa' as const,

        // Booking details (ISO format for dates)
        checkIn: checkIn ? checkIn.toISOString().split('T')[0] : undefined,
        checkOut: checkOut ? checkOut.toISOString().split('T')[0] : undefined,
        guests: guests || undefined,
        message: formData.message.trim() || undefined,
        budget: price || undefined,

        // Attribution
        source: 'ERentals Exclusive App',
        utm_source: attribution?.utm_source,
        utm_medium: attribution?.utm_medium,
        utm_campaign: attribution?.utm_campaign,
        utm_content: attribution?.utm_content,
        utm_term: attribution?.utm_term,
        er_id: attribution?.er_id,
        creator_id: attribution?.creator_id,
      };

      let hasWarning = false;
      try {
        const response = await fetch('/api/inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('Inquiry API response:', result);

        if (!response.ok || !result.ok) {
          console.warn('Inquiry submission issue:', result);
          hasWarning = true;
        } else if (result.warning) {
          console.warn('Inquiry warning:', result.warning);
          hasWarning = true;
        }
      } catch (apiError) {
        // Log but don't fail - still show confirmation with warning
        console.warn('Inquiry API error, but continuing:', apiError);
        hasWarning = true;
      }

      // Log for development
      console.log('Booking inquiry submitted:', payload);

      onSuccess(hasWarning);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Unable to submit your inquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Request to Book</Text>
              <Text style={styles.propertyName}>{propertyName}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color={BrandColors.black} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Booking Summary - Interactive */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Pressable
                  style={({ pressed }) => [styles.summaryItem, styles.summaryItemTouchable, pressed && styles.summaryItemPressed]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.summaryLabel}>Check-in</Text>
                  <View style={styles.summaryValueRow}>
                    <Text style={[styles.summaryValue, !checkIn && styles.summaryValuePlaceholder]}>
                      {formatDate(checkIn)}
                    </Text>
                    <Feather name="calendar" size={14} color={BrandColors.gray.medium} />
                  </View>
                </Pressable>
                <View style={styles.summaryDivider} />
                <Pressable
                  style={({ pressed }) => [styles.summaryItem, styles.summaryItemTouchable, pressed && styles.summaryItemPressed]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.summaryLabel}>Check-out</Text>
                  <View style={styles.summaryValueRow}>
                    <Text style={[styles.summaryValue, !checkOut && styles.summaryValuePlaceholder]}>
                      {formatDate(checkOut)}
                    </Text>
                    <Feather name="calendar" size={14} color={BrandColors.gray.medium} />
                  </View>
                </Pressable>
              </View>
              <View style={styles.summaryRow}>
                <Pressable
                  style={({ pressed }) => [styles.summaryItem, styles.summaryItemTouchable, pressed && styles.summaryItemPressed]}
                  onPress={() => setShowGuestPicker(true)}
                >
                  <Text style={styles.summaryLabel}>Guests</Text>
                  <View style={styles.summaryValueRow}>
                    <Text style={styles.summaryValue}>{guests} guest{guests !== 1 ? 's' : ''}</Text>
                    <Feather name="users" size={14} color={BrandColors.gray.medium} />
                  </View>
                </Pressable>
                {price && (
                  <>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>From</Text>
                      <Text style={styles.summaryValue}>{price.replace('From ', '')}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Price Breakdown - Shows when dates are selected */}
            {priceCalculation && (
              <View style={styles.priceBreakdown}>
                <Text style={styles.priceBreakdownTitle}>Price Details</Text>
                {priceCalculation.nightlyRate ? (
                  <>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceRowLabel}>
                        {formatCurrency(priceCalculation.nightlyRate)} × {priceCalculation.nights} night{priceCalculation.nights !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.priceRowValue}>
                        {formatCurrency(priceCalculation.subtotal!)}
                      </Text>
                    </View>
                    <View style={styles.priceTotalRow}>
                      <Text style={styles.priceTotalLabel}>Total</Text>
                      <Text style={styles.priceTotalValue}>
                        {formatCurrency(priceCalculation.total!)}
                      </Text>
                    </View>
                    <Text style={styles.priceNote}>
                      Final price may vary based on availability and season
                    </Text>
                  </>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceRowLabel}>
                      {priceCalculation.nights} night{priceCalculation.nights !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.priceRowValue}>Contact for pricing</Text>
                  </View>
                )}
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    value={formData.firstName}
                    onChangeText={(v) => updateField('firstName', v)}
                    placeholder="John"
                    placeholderTextColor={BrandColors.gray.medium}
                    autoCapitalize="words"
                    autoComplete="given-name"
                  />
                  {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Last Name *</Text>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={formData.lastName}
                    onChangeText={(v) => updateField('lastName', v)}
                    placeholder="Smith"
                    placeholderTextColor={BrandColors.gray.medium}
                    autoCapitalize="words"
                    autoComplete="family-name"
                  />
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(v) => updateField('email', v)}
                  placeholder="john@example.com"
                  placeholderTextColor={BrandColors.gray.medium}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={BrandColors.gray.medium}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* WhatsApp Preference */}
              <Pressable
                style={styles.checkboxRow}
                onPress={() => updateField('preferWhatsApp', !formData.preferWhatsApp)}
              >
                <View style={[styles.checkbox, formData.preferWhatsApp && styles.checkboxChecked]}>
                  {formData.preferWhatsApp && (
                    <Feather name="check" size={14} color={BrandColors.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Contact me via WhatsApp</Text>
              </Pressable>

              <View style={styles.field}>
                <Text style={styles.label}>Message (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.message}
                  onChangeText={(v) => updateField('message', v)}
                  placeholder="Any special requests or questions..."
                  placeholderTextColor={BrandColors.gray.medium}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Submit Error */}
            {submitError && (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={16} color="#dc2626" />
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={BrandColors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Inquiry</Text>
              )}
            </Pressable>

            {/* Footer Note */}
            <Text style={styles.footerNote}>
              Our concierge team will respond within 24 hours. No payment required to inquire.
            </Text>
          </ScrollView>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Dates</Text>
              <Pressable style={styles.pickerCloseButton} onPress={() => setShowDatePicker(false)}>
                <Feather name="x" size={24} color={BrandColors.black} />
              </Pressable>
            </View>
            <DatePicker
              startDate={checkIn || undefined}
              endDate={checkOut || undefined}
              onDatesChange={handleDatesChange}
              minDate={new Date()}
              minNights={minStayNights}
              blockedDates={blockedDates}
            />
            <Pressable
              style={styles.pickerApplyButton}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.pickerApplyButtonText}>
                {checkIn && checkOut ? 'Apply Dates' : 'Done'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Guest Picker Modal */}
      <Modal
        visible={showGuestPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuestPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.guestPickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Number of Guests</Text>
              <Pressable style={styles.pickerCloseButton} onPress={() => setShowGuestPicker(false)}>
                <Feather name="x" size={24} color={BrandColors.black} />
              </Pressable>
            </View>
            <View style={styles.guestPickerContent}>
              <View style={styles.guestRow}>
                <Text style={styles.guestLabel}>Guests</Text>
                <View style={styles.guestControls}>
                  <Pressable
                    style={[styles.guestButton, guests <= 1 && styles.guestButtonDisabled]}
                    onPress={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                  >
                    <Feather name="minus" size={18} color={guests <= 1 ? BrandColors.gray.border : BrandColors.gray.dark} />
                  </Pressable>
                  <Text style={styles.guestCount}>{guests}</Text>
                  <Pressable
                    style={[styles.guestButton, guests >= 40 && styles.guestButtonDisabled]}
                    onPress={() => setGuests(Math.min(40, guests + 1))}
                    disabled={guests >= 40}
                  >
                    <Feather name="plus" size={18} color={guests >= 40 ? BrandColors.gray.border : BrandColors.gray.dark} />
                  </Pressable>
                </View>
              </View>
            </View>
            <Pressable
              style={styles.pickerApplyButton}
              onPress={() => setShowGuestPicker(false)}
            >
              <Text style={styles.pickerApplyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
      },
    }),
  },
  modal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85vh',
    ...Shadow.xl,
    ...Platform.select({
      web: {
        maxHeight: '85vh',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: Space[6],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  headerContent: {
    flex: 1,
    paddingRight: Space[4],
  },
  title: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[1],
  },
  propertyName: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  closeButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -Space[2],
    marginRight: -Space[2],
  },
  scrollContent: {
    padding: Space[6],
  },
  summaryCard: {
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.lg,
    padding: Space[4],
    marginBottom: Space[6],
    gap: Space[3],
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: BrandColors.gray.border,
    marginHorizontal: Space[4],
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  form: {
    gap: Space[4],
  },
  row: {
    flexDirection: 'row',
    gap: Space[4],
  },
  halfField: {
    flex: 1,
  },
  field: {
    width: '100%',
  },
  label: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.black,
    minHeight: TouchTarget.min,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  textArea: {
    minHeight: 100,
    paddingTop: Space[3],
  },
  errorText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: '#dc2626',
    marginTop: Space[1],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingVertical: Space[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: BrandColors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: BrandColors.black,
    borderColor: BrandColors.black,
  },
  checkboxLabel: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.black,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: '#fef2f2',
    borderRadius: Radius.md,
    padding: Space[4],
    marginTop: Space[4],
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: '#dc2626',
  },
  submitButton: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.md,
    paddingVertical: Space[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.comfortable,
    marginTop: Space[6],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginTop: Space[4],
    marginBottom: Space[2],
  },
  // Interactive summary item styles
  summaryItemTouchable: {
    borderRadius: Radius.md,
    padding: Space[2],
    margin: -Space[2],
  },
  summaryItemPressed: {
    backgroundColor: BrandColors.white,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  summaryValuePlaceholder: {
    color: BrandColors.gray.medium,
    fontWeight: FontWeight.normal,
  },
  // Price breakdown styles
  priceBreakdown: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.lg,
    padding: Space[4],
    marginBottom: Space[6],
  },
  priceBreakdownTitle: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[3],
    paddingBottom: Space[2],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Space[2],
  },
  priceRowLabel: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.dark,
  },
  priceRowValue: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Space[3],
    marginTop: Space[2],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
  },
  priceTotalLabel: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  priceTotalValue: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
  },
  priceNote: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginTop: Space[3],
    fontStyle: 'italic',
  },
  // Picker overlay and modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
  },
  pickerModal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 420,
    padding: Space[6],
    ...Shadow.xl,
  },
  guestPickerModal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 360,
    padding: Space[6],
    ...Shadow.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[4],
  },
  pickerTitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  pickerCloseButton: {
    width: TouchTarget.min,
    height: TouchTarget.min,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -Space[2],
  },
  pickerApplyButton: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.md,
    paddingVertical: Space[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TouchTarget.min,
    marginTop: Space[4],
  },
  pickerApplyButtonText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  guestPickerContent: {
    paddingVertical: Space[4],
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guestLabel: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  guestControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[5],
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
    opacity: 0.5,
  },
  guestCount: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    minWidth: 40,
    textAlign: 'center',
  },
});
