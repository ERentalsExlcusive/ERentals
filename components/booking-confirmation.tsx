import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow, TouchTarget } from '@/constants/design-tokens';

interface BookingConfirmationProps {
  propertyName: string;
  onClose: () => void;
  webhookWarning?: boolean;
}

export function BookingConfirmation({ propertyName, onClose, webhookWarning }: BookingConfirmationProps) {
  const whatsappNumber = '+639282286597'; // ERentals WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Hi! I just submitted an inquiry for ${propertyName} on ERentals Exclusive. I'd love to discuss availability and next steps.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`;

  const handleWhatsApp = () => {
    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    } else {
      Linking.openURL(whatsappUrl);
    }
  };

  const handleEmail = () => {
    const emailUrl = `mailto:info@erentalsexclusive.com?subject=Inquiry: ${encodeURIComponent(propertyName)}`;
    if (Platform.OS === 'web') {
      window.open(emailUrl);
    } else {
      Linking.openURL(emailUrl);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Feather name="check" size={32} color={BrandColors.white} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Inquiry Sent!</Text>
        <Text style={styles.subtitle}>
          Thank you for your interest in {propertyName}. Our concierge team will be in touch within 24 hours.
        </Text>

        {/* Webhook Warning - when system couldn't deliver instantly */}
        {webhookWarning && (
          <View style={styles.warningBanner}>
            <Feather name="info" size={16} color="#92400e" />
            <Text style={styles.warningText}>
              For faster processing, please message us on WhatsApp below.
            </Text>
          </View>
        )}

        {/* WhatsApp CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaLabel}>Want a faster response?</Text>
          <Pressable style={styles.whatsappButton} onPress={handleWhatsApp}>
            <View style={styles.whatsappIcon}>
              <Feather name="message-circle" size={20} color={BrandColors.white} />
            </View>
            <Text style={styles.whatsappText}>Message us on WhatsApp</Text>
          </Pressable>
        </View>

        {/* Alternative Contact */}
        <View style={styles.alternativeSection}>
          <Text style={styles.alternativeLabel}>Or reach us directly</Text>
          <View style={styles.contactRow}>
            <Pressable style={styles.contactItem} onPress={handleEmail}>
              <Feather name="mail" size={18} color={BrandColors.black} />
              <Text style={styles.contactText}>info@erentalsexclusive.com</Text>
            </Pressable>
            <View style={styles.contactItem}>
              <Feather name="phone" size={18} color={BrandColors.black} />
              <Text style={styles.contactText}>+63 928 228 6597</Text>
            </View>
          </View>
        </View>

        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Continue Browsing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[4],
  },
  modal: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 420,
    padding: Space[8],
    alignItems: 'center',
    ...Shadow.xl,
  },
  iconContainer: {
    marginBottom: Space[6],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BrandColors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  subtitle: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base + 4,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Space[8],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: '#fef3c7',
    borderRadius: Radius.md,
    padding: Space[3],
    marginBottom: Space[6],
    width: '100%',
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: '#92400e',
  },
  ctaSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Space[6],
  },
  ctaLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginBottom: Space[3],
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    borderRadius: Radius.md,
    paddingVertical: Space[4],
    paddingHorizontal: Space[6],
    width: '100%',
    minHeight: TouchTarget.comfortable,
    gap: Space[3],
  },
  whatsappIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  alternativeSection: {
    width: '100%',
    paddingTop: Space[6],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    marginBottom: Space[6],
  },
  alternativeLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[4],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactRow: {
    gap: Space[3],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space[3],
    paddingVertical: Space[2],
  },
  contactText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.black,
    fontWeight: FontWeight.medium,
  },
  closeButton: {
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    minHeight: TouchTarget.min,
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
});
