import { StyleSheet, View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { useOwnerAuth } from '@/context/owner-auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useOwnerData, getRecentInquiries } from '@/hooks/use-owner-data';
import { INQUIRY_STAGES, OwnerInquiry } from '@/data/mock-owner-data';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { user, isAuthenticated, logout } = useOwnerAuth();
  const { stats, inquiries, isLoading: dataLoading } = useOwnerData();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/owner-portal');
    }
  }, [isAuthenticated, router]);

  const recentInquiries = getRecentInquiries(inquiries, 5);

  const handleLogout = () => {
    logout();
    router.replace('/owner-portal');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.logoButton} onPress={() => router.push('/')}>
            <Feather name="home" size={20} color={BrandColors.secondary} />
          </Pressable>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={BrandColors.gray.dark} />
          {!isMobile && <Text style={styles.logoutText}>Sign Out</Text>}
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {/* Stats Cards */}
          <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Feather name="home" size={24} color={BrandColors.white} />
              <Text style={styles.statNumber}>{dataLoading ? '-' : stats.totalAssets}</Text>
              <Text style={styles.statLabel}>Total Assets</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="message-square" size={24} color={BrandColors.secondary} />
              <Text style={styles.statNumberDark}>{dataLoading ? '-' : stats.totalInquiries}</Text>
              <Text style={styles.statLabelDark}>Inquiries</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="calendar" size={24} color={BrandColors.secondary} />
              <Text style={styles.statNumberDark}>{dataLoading ? '-' : stats.confirmedBookings}</Text>
              <Text style={styles.statLabelDark}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="bell" size={24} color={BrandColors.secondary} />
              <Text style={styles.statNumberDark}>{dataLoading ? '-' : stats.newInquiries}</Text>
              <Text style={styles.statLabelDark}>New</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={[styles.actionsGrid, isMobile && styles.actionsGridMobile]}>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/owner-portal/assets')}
              >
                <Feather name="grid" size={24} color={BrandColors.black} />
                <Text style={styles.actionText}>View Assets</Text>
              </Pressable>
              <Pressable
                style={styles.actionCard}
                onPress={() => router.push('/owner-portal/inquiries')}
              >
                <Feather name="inbox" size={24} color={BrandColors.black} />
                <Text style={styles.actionText}>Manage Inquiries</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Inquiries */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Inquiries</Text>
              <Pressable onPress={() => router.push('/owner-portal/inquiries')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            </View>

            <View style={styles.inquiriesTable}>
              {recentInquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} isMobile={isMobile} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InquiryRow({ inquiry, isMobile }: { inquiry: OwnerInquiry; isMobile: boolean }) {
  const stageConfig = INQUIRY_STAGES[inquiry.stage];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.inquiryRow, isMobile && styles.inquiryRowMobile]}>
      <View style={styles.inquiryMain}>
        <Text style={styles.inquiryGuest}>{inquiry.guestName}</Text>
        <Text style={styles.inquiryProperty}>{inquiry.propertyName}</Text>
        {!isMobile && (
          <Text style={styles.inquiryDates}>
            {formatDate(inquiry.checkIn)} - {formatDate(inquiry.checkOut)}
          </Text>
        )}
      </View>
      <View style={[styles.stageBadge, { backgroundColor: `${stageConfig.color}20` }]}>
        <Text style={[styles.stageText, { color: stageConfig.color }]}>
          {stageConfig.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.gray.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.white,
    paddingHorizontal: Space[8],
    paddingVertical: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
      },
    }),
  },
  headerMobile: {
    paddingHorizontal: Space[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[4],
  },
  logoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${BrandColors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  userName: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
  },
  logoutText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Space[8],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    padding: Space[4],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[4],
    marginBottom: Space[8],
  },
  statsGridMobile: {
    gap: Space[3],
  },
  statCard: {
    flex: 1,
    minWidth: Platform.select({ web: 200, default: '45%' }) as any,
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    padding: Space[6],
    alignItems: 'center',
    ...Shadow.base,
  },
  statCardPrimary: {
    backgroundColor: BrandColors.black,
  },
  statNumber: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.white,
    marginTop: Space[3],
  },
  statNumberDark: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    fontWeight: FontWeight.bold,
    color: BrandColors.black,
    marginTop: Space[3],
  },
  statLabel: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  statLabelDark: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    marginTop: Space[1],
  },
  section: {
    marginBottom: Space[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[4],
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  viewAllLink: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.secondary,
    fontWeight: FontWeight.medium,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Space[4],
  },
  actionsGridMobile: {
    flexDirection: 'column',
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3],
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    padding: Space[5],
    ...Shadow.base,
  },
  actionText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  inquiriesTable: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.base,
  },
  inquiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Space[4],
    paddingHorizontal: Space[5],
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  inquiryRowMobile: {
    paddingHorizontal: Space[4],
  },
  inquiryMain: {
    flex: 1,
  },
  inquiryGuest: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,
    color: BrandColors.black,
  },
  inquiryProperty: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    marginTop: Space[1],
  },
  inquiryDates: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    color: BrandColors.gray.medium,
    marginTop: Space[1],
  },
  stageBadge: {
    paddingVertical: Space[1],
    paddingHorizontal: Space[3],
    borderRadius: Radius.full,
  },
  stageText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
  },
});
