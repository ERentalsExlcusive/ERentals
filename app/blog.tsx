import { StyleSheet, View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/header';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';

export default function BlogScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = () => {
    if (email.includes('@')) {
      setSubmitted(true);
      // TODO: Submit to newsletter backend
    }
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
          <View style={styles.iconWrapper}>
            <Feather name="edit-3" size={48} color={BrandColors.secondary} />
          </View>

          <Text style={[styles.title, isMobile && styles.titleMobile]}>Blog Coming Soon</Text>
          <View style={styles.goldDivider} />

          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Travel stories, destination guides, and insider tips from the world of luxury rentals.
          </Text>

          <View style={styles.previewCards}>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Coming Up</Text>
              <Text style={styles.previewTitle}>Top 10 Villas in Tulum for 2026</Text>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Coming Up</Text>
              <Text style={styles.previewTitle}>Yacht Charter Guide: Mediterranean vs Caribbean</Text>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Coming Up</Text>
              <Text style={styles.previewTitle}>The Rise of Luxury Transport Experiences</Text>
            </View>
          </View>

          {/* Newsletter Signup */}
          <View style={styles.newsletterSection}>
            <Text style={styles.newsletterTitle}>Be the First to Know</Text>
            <Text style={styles.newsletterText}>
              Subscribe to get notified when we launch and receive exclusive travel content.
            </Text>

            {submitted ? (
              <View style={styles.successMessage}>
                <Feather name="check-circle" size={24} color={BrandColors.secondary} />
                <Text style={styles.successText}>You're on the list!</Text>
              </View>
            ) : (
              <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
                <TextInput
                  style={[styles.input, isMobile && styles.inputMobile]}
                  placeholder="Enter your email"
                  placeholderTextColor={BrandColors.gray.medium}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
                  <Text style={styles.subscribeButtonText}>Subscribe</Text>
                </Pressable>
              </View>
            )}
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
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  contentMobile: {
    paddingHorizontal: Space[4],
    paddingTop: Space[16],
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[6],
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
  },
  subtitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    marginBottom: Space[10],
    maxWidth: 500,
  },
  subtitleMobile: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
  },
  previewCards: {
    gap: Space[4],
    width: '100%',
    marginBottom: Space[12],
  },
  previewCard: {
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.lg,
    padding: Space[6],
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.secondary,
  },
  previewLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Space[2],
  },
  previewTitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  newsletterSection: {
    backgroundColor: BrandColors.black,
    borderRadius: Radius.xl,
    padding: Space[8],
    alignItems: 'center',
    width: '100%',
  },
  newsletterTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
    marginBottom: Space[2],
  },
  newsletterText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.medium,
    textAlign: 'center',
    marginBottom: Space[6],
  },
  formRow: {
    flexDirection: 'row',
    gap: Space[3],
    width: '100%',
    maxWidth: 400,
  },
  formRowMobile: {
    flexDirection: 'column',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: BrandColors.gray.dark,
    borderRadius: Radius.lg,
    paddingVertical: Space[3],
    paddingHorizontal: Space[4],
    fontSize: FontSize.md,
    color: BrandColors.white,
    backgroundColor: 'transparent',
  },
  inputMobile: {
    paddingVertical: Space[4],
  },
  subscribeButton: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonText: {
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
    color: BrandColors.white,
  },
});
