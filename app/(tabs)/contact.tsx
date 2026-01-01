import { StyleSheet, View, Text, Linking, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors, Spacing } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/header';
import { useResponsive } from '@/hooks/use-responsive';

export default function ContactScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  const handleEmail = () => {
    Linking.openURL('mailto:info@erentalsexclusive.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/639282286597');
  };

  return (
    <View style={styles.container}>
      <Header onHomePress={() => router.push('/')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>Get in Touch</Text>

          {/* Gold Divider */}
          <View style={styles.goldDivider} />

          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Our concierge team is available 24/7 to assist with your luxury rental needs
          </Text>

          <View style={styles.contactMethods}>
            <Pressable style={[styles.contactCard, isMobile && styles.contactCardMobile]} onPress={handleEmail}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>info@erentalsexclusive.com</Text>
            </Pressable>

            <Pressable style={[styles.contactCard, isMobile && styles.contactCardMobile]} onPress={handleWhatsApp}>
              <View style={styles.iconContainer}>
                <Feather name="message-circle" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.contactLabel}>Contact Our Concierge</Text>
              <Text style={styles.contactValue}>+63 928 228 6597</Text>
              <Text style={styles.contactSubtext}>via WhatsApp</Text>
            </Pressable>
          </View>

          {/* Additional Info */}
          <View style={[styles.infoSection, isMobile && styles.infoSectionMobile]}>
            <Text style={styles.infoTitle}>Preferred Contact Method</Text>
            <Text style={styles.infoText}>
              For the fastest response, message us on WhatsApp. Our concierge team typically responds within minutes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
    width: '100%',
    maxWidth: '100vw',
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 100,
    width: '100%',
  },
  content: {
    paddingHorizontal: Spacing.xxl * 2,
    paddingTop: Spacing.xxl * 4,
    paddingBottom: Spacing.xxl * 2,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    letterSpacing: -1.2,
  },
  titleMobile: {
    fontSize: 36,
    letterSpacing: -0.8,
  },
  goldDivider: {
    height: 2,
    width: 80,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.lg,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Spacing.xxl * 2,
    lineHeight: 30,
  },
  subtitleMobile: {
    fontSize: 16,
    lineHeight: 26,
  },
  contactMethods: {
    gap: Spacing.xl,
  },
  contactCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: Spacing.xxl * 1.5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  contactCardMobile: {
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  contactValue: {
    fontSize: 20,
    fontWeight: '600',
    color: BrandColors.black,
    marginBottom: Spacing.xs,
  },
  contactSubtext: {
    fontSize: 14,
    color: BrandColors.gray.medium,
    fontStyle: 'italic',
  },
  infoSection: {
    marginTop: Spacing.xxl * 2,
    padding: Spacing.xxl,
    backgroundColor: BrandColors.gray.light,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.secondary,
  },
  infoSectionMobile: {
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 26,
    color: BrandColors.gray.dark,
  },
});
