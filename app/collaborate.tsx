import { StyleSheet, View, Text, ScrollView, TextInput, Pressable, Linking } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/header';
import { BrandColors, Spacing } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';

export default function CollaborateScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes('@')) {
      setSubmitted(true);
      // TODO: Submit to backend
    }
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/639282286597?text=I%27m%20interested%20in%20collaborating%20with%20ERentals');
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
          <Text style={[styles.title, isMobile && styles.titleMobile]}>Partner With Us</Text>
          <View style={styles.goldDivider} />
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Join our network of luxury property owners and creators
          </Text>

          {/* Partner Types */}
          <View style={styles.cardsContainer}>
            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="home" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Property Owners</Text>
              <Text style={styles.cardText}>
                List your luxury villa, yacht, or vehicle with ERentals. Reach discerning travelers worldwide with our curated marketplace.
              </Text>
            </View>

            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="users" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Creators & Influencers</Text>
              <Text style={styles.cardText}>
                Partner with us to feature stunning properties. Earn commissions while sharing unforgettable travel experiences.
              </Text>
            </View>

            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="briefcase" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>Travel Agencies</Text>
              <Text style={styles.cardText}>
                Access our portfolio of premium rentals for your clients. Competitive commissions and dedicated support.
              </Text>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Get Started</Text>

            {submitted ? (
              <View style={styles.successMessage}>
                <Feather name="check-circle" size={24} color={BrandColors.secondary} />
                <Text style={styles.successText}>Thanks! We'll be in touch soon.</Text>
              </View>
            ) : (
              <View style={styles.formRow}>
                <TextInput
                  style={[styles.input, isMobile && styles.inputMobile]}
                  placeholder="Enter your email"
                  placeholderTextColor={BrandColors.gray.medium}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.orText}>or</Text>

            <Pressable style={styles.whatsappButton} onPress={handleWhatsApp}>
              <Feather name="message-circle" size={20} color={BrandColors.white} />
              <Text style={styles.whatsappButtonText}>Message on WhatsApp</Text>
            </Pressable>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: Space[12],
    paddingTop: Space[24],
    paddingBottom: Space[12],
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    paddingHorizontal: Space[4],
    paddingTop: Space[16],
  },
  title: {
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginBottom: Space[4],
    textAlign: 'center',
    letterSpacing: -1,
  },
  titleMobile: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
  },
  goldDivider: {
    height: 2,
    width: 80,
    backgroundColor: BrandColors.secondary,
    marginVertical: Space[4],
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Space[12],
  },
  subtitleMobile: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  },
  cardsContainer: {
    gap: Space[6],
    marginBottom: Space[12],
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.xl,
    padding: Space[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  cardMobile: {
    padding: Space[6],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[4],
  },
  cardTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  cardText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.dark,
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.xl,
    padding: Space[8],
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[6],
  },
  formRow: {
    flexDirection: 'row',
    gap: Space[3],
    width: '100%',
    maxWidth: 400,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    borderRadius: Radius.lg,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    fontSize: FontSize.md,
    color: BrandColors.black,
    backgroundColor: BrandColors.white,
  },
  inputMobile: {
    paddingVertical: Space[4],
  },
  submitButton: {
    backgroundColor: BrandColors.black,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Radius.lg,
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    paddingVertical: Space[4],
  },
  successText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  orText: {
    fontSize: FontSize.sm,
    color: BrandColors.gray.medium,
    marginVertical: Space[4],
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    backgroundColor: '#25D366',
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Radius.lg,
  },
  whatsappButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
});
