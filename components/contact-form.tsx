import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';
import { BrandButton } from './brand-button';
import { BrandColors, Spacing } from '@/constants/theme';

interface ContactFormProps {
  propertyTitle?: string;
  onSubmit?: (formData: ContactFormData) => void;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  checkIn?: string;
  checkOut?: string;
}

export function ContactForm({ propertyTitle, onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: propertyTitle
      ? `I'm interested in ${propertyTitle}. Please send me more information.`
      : '',
    checkIn: '',
    checkOut: '',
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit?.(formData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Information</Text>
      <Text style={styles.subtitle}>
        Fill out the form below and we'll get back to you within 24 hours
      </Text>

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={BrandColors.gray.medium}
            value={formData.name}
            onChangeText={(name) => setFormData({ ...formData, name })}
          />
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={BrandColors.gray.medium}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(email) => setFormData({ ...formData, email })}
          />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor={BrandColors.gray.medium}
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(phone) => setFormData({ ...formData, phone })}
          />
        </View>

        {/* Dates */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Check In</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={BrandColors.gray.medium}
              value={formData.checkIn}
              onChangeText={(checkIn) => setFormData({ ...formData, checkIn })}
            />
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Check Out</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={BrandColors.gray.medium}
              value={formData.checkOut}
              onChangeText={(checkOut) => setFormData({ ...formData, checkOut })}
            />
          </View>
        </View>

        {/* Message */}
        <View style={styles.field}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about your travel plans..."
            placeholderTextColor={BrandColors.gray.medium}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={formData.message}
            onChangeText={(message) => setFormData({ ...formData, message })}
          />
        </View>

        {/* Submit Button */}
        <BrandButton
          title="Send Inquiry"
          variant="primary"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: BrandColors.gray.dark,
    marginBottom: Spacing.xxl,
  },
  form: {
    gap: Spacing.lg,
  },
  field: {
    width: '100%',
  },
  row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    color: BrandColors.black,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
