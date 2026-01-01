import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors, Spacing } from '@/constants/theme';
import { Header } from '@/components/header';
import { useResponsive } from '@/hooks/use-responsive';

export default function CreatorHubScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();

  return (
    <View style={styles.container}>
      <Header onHomePress={() => router.push('/')} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          {/* Avatar Grid Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.avatarGrid}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View key={index} style={styles.avatarCircle}>
                  <Feather name="user" size={isMobile ? 16 : 20} color={BrandColors.secondary} />
                </View>
              ))}
            </View>
            <View style={styles.lockBadge}>
              <Feather name="lock" size={isMobile ? 14 : 16} color={BrandColors.white} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isMobile && styles.titleMobile]}>
            Creator Hub
          </Text>

          {/* Gold Divider */}
          <View style={styles.goldDivider} />

          {/* Subtitle */}
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Launching Soon
          </Text>

          {/* Description */}
          <Text style={[styles.description, isMobile && styles.descriptionMobile]}>
            A curated marketplace connecting luxury travelers with the world's most talented creators.
            Discover exclusive stays through cinematic content, browse creator portfolios, and experience
            properties like never before.
          </Text>

          {/* Feature Pills */}
          <View style={[styles.features, isMobile && styles.featuresMobile]}>
            <View style={styles.featurePill}>
              <Feather name="video" size={16} color={BrandColors.secondary} />
              <Text style={styles.featureText}>Cinematic Content</Text>
            </View>
            <View style={styles.featurePill}>
              <Feather name="users" size={16} color={BrandColors.secondary} />
              <Text style={styles.featureText}>Creator Profiles</Text>
            </View>
            <View style={styles.featurePill}>
              <Feather name="trending-up" size={16} color={BrandColors.secondary} />
              <Text style={styles.featureText}>Performance Metrics</Text>
            </View>
            <View style={styles.featurePill}>
              <Feather name="globe" size={16} color={BrandColors.secondary} />
              <Text style={styles.featureText}>Curated Feeds</Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Features */}
        <View style={[styles.featuresSection, isMobile && styles.featuresSectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>
            What's Coming
          </Text>

          <View style={styles.featureCards}>
            {/* For Travelers */}
            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.cardIcon}>
                <Feather name="compass" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>For Travelers</Text>
              <Text style={styles.cardDescription}>
                Browse creator profiles like social feeds. Save your favorite creators.
                Discover luxury stays through stunning visual storytelling.
              </Text>
            </View>

            {/* For Creators */}
            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.cardIcon}>
                <Feather name="camera" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>For Creators</Text>
              <Text style={styles.cardDescription}>
                Showcase your portfolio. Track performance metrics. Get discovered by
                property owners seeking premium content.
              </Text>
            </View>

            {/* For Owners */}
            <View style={[styles.card, isMobile && styles.cardMobile]}>
              <View style={styles.cardIcon}>
                <Feather name="home" size={28} color={BrandColors.secondary} />
              </View>
              <Text style={styles.cardTitle}>For Owners</Text>
              <Text style={styles.cardDescription}>
                Browse verified creators. Review portfolios and analytics.
                Book creators for professional property shoots.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={[styles.ctaSection, isMobile && styles.ctaSectionMobile]}>
          <Feather name="bell" size={isMobile ? 32 : 40} color={BrandColors.white} />
          <Text style={[styles.ctaTitle, isMobile && styles.ctaTitleMobile]}>
            Be the First to Know
          </Text>
          <Text style={styles.ctaDescription}>
            Creator Hub is launching soon. Stay tuned for the future of luxury travel content.
          </Text>
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
  hero: {
    paddingHorizontal: Spacing.xxl * 2,
    paddingTop: Platform.select({ web: Spacing.xxl * 4, default: Spacing.xxl * 2 }),
    paddingBottom: Spacing.xxl * 3,
    alignItems: 'center',
    backgroundColor: BrandColors.white,
  },
  heroMobile: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xxl * 1.5,
    paddingBottom: Spacing.xxl * 1.5,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: Spacing.xxl,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    height: 80,
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BrandColors.secondary,
    backgroundColor: `${BrandColors.secondary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BrandColors.white,
  },
  title: {
    fontSize: 56,
    fontWeight: '700',
    color: BrandColors.black,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -1.5,
  },
  titleMobile: {
    fontSize: 40,
    letterSpacing: -1,
  },
  goldDivider: {
    height: 2,
    width: 80,
    backgroundColor: BrandColors.secondary,
    marginVertical: Spacing.lg,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: BrandColors.secondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: Spacing.lg,
  },
  subtitleMobile: {
    fontSize: 18,
    letterSpacing: 2,
  },
  description: {
    fontSize: 18,
    lineHeight: 32,
    color: BrandColors.gray.dark,
    textAlign: 'center',
    maxWidth: 700,
    marginBottom: Spacing.xxl,
  },
  descriptionMobile: {
    fontSize: 16,
    lineHeight: 28,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    maxWidth: 800,
  },
  featuresMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: BrandColors.gray.light,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: BrandColors.black,
  },
  featuresSection: {
    paddingHorizontal: Spacing.xxl * 2,
    paddingVertical: Spacing.xxl * 2,
    backgroundColor: BrandColors.gray.light,
  },
  featuresSectionMobile: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: BrandColors.black,
    textAlign: 'center',
    marginBottom: Spacing.xxl * 1.5,
    letterSpacing: -1,
  },
  sectionTitleMobile: {
    fontSize: 28,
  },
  featureCards: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Spacing.xl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: BrandColors.white,
    padding: Spacing.xxl * 1.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.gray.border,
    alignItems: 'center',
    minWidth: Platform.OS === 'web' ? 280 : undefined,
    maxWidth: Platform.OS === 'web' ? 350 : undefined,
  },
  cardMobile: {
    padding: Spacing.xl,
    maxWidth: undefined,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BrandColors.black,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 26,
    color: BrandColors.gray.dark,
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: Spacing.xxl * 2,
    paddingVertical: Spacing.xxl * 3,
    backgroundColor: BrandColors.black,
    alignItems: 'center',
  },
  ctaSectionMobile: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl * 2,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.white,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  ctaTitleMobile: {
    fontSize: 24,
  },
  ctaDescription: {
    fontSize: 16,
    lineHeight: 28,
    color: BrandColors.gray.light,
    textAlign: 'center',
    maxWidth: 600,
  },
});
