import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Header } from '@/components/header';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius } from '@/constants/design-tokens';
import { useResponsive } from '@/hooks/use-responsive';

export default function AboutScreen() {
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
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>About ERentals</Text>
          <View style={styles.goldDivider} />

          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Curating exceptional travel experiences since 2024
          </Text>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              ERentals Exclusive connects discerning travelers with the world's most remarkable properties. From stunning oceanfront villas to luxury yachts and premium transport, we curate experiences that transcend ordinary travel.
            </Text>
          </View>

          {/* Values */}
          <View style={styles.valuesGrid}>
            <View style={[styles.valueCard, isMobile && styles.valueCardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="award" size={24} color={BrandColors.secondary} />
              </View>
              <Text style={styles.valueTitle}>Excellence</Text>
              <Text style={styles.valueText}>
                Every property in our collection meets rigorous quality standards.
              </Text>
            </View>

            <View style={[styles.valueCard, isMobile && styles.valueCardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="shield" size={24} color={BrandColors.secondary} />
              </View>
              <Text style={styles.valueTitle}>Trust</Text>
              <Text style={styles.valueText}>
                Transparent pricing and verified properties you can count on.
              </Text>
            </View>

            <View style={[styles.valueCard, isMobile && styles.valueCardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="headphones" size={24} color={BrandColors.secondary} />
              </View>
              <Text style={styles.valueTitle}>Service</Text>
              <Text style={styles.valueText}>
                24/7 concierge support for seamless booking experiences.
              </Text>
            </View>

            <View style={[styles.valueCard, isMobile && styles.valueCardMobile]}>
              <View style={styles.iconContainer}>
                <Feather name="globe" size={24} color={BrandColors.secondary} />
              </View>
              <Text style={styles.valueTitle}>Global Reach</Text>
              <Text style={styles.valueText}>
                Properties across the world's most desirable destinations.
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>90+</Text>
              <Text style={styles.statLabel}>Curated Properties</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Countries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Concierge Support</Text>
            </View>
          </View>

          {/* Contact CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Questions? Our team is here to help.
            </Text>
            <Text style={styles.ctaEmail}>info@erentalsexclusive.com</Text>
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
    maxWidth: 900,
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
  section: {
    marginBottom: Space[12],
  },
  sectionTitle: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[4],
    textAlign: 'center',
  },
  sectionText: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    color: BrandColors.gray.dark,
    textAlign: 'center',
  },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[4],
    marginBottom: Space[12],
  },
  valueCard: {
    width: '48%',
    backgroundColor: BrandColors.gray.light,
    borderRadius: Radius.lg,
    padding: Space[6],
  },
  valueCardMobile: {
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[3],
  },
  valueTitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  valueText: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    color: BrandColors.gray.dark,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: BrandColors.black,
    borderRadius: Radius.xl,
    padding: Space[8],
    marginBottom: Space[12],
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.secondary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  ctaSection: {
    alignItems: 'center',
    paddingVertical: Space[8],
  },
  ctaText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.dark,
    marginBottom: Space[2],
  },
  ctaEmail: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
});
