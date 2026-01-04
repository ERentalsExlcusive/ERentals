import { StyleSheet, View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { useOwnerAuth } from '@/context/owner-auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useOwnerData } from '@/hooks/use-owner-data';
import { INQUIRY_STAGES, OwnerInquiry } from '@/data/mock-owner-data';

type StageFilter = 'all' | OwnerInquiry['stage'];

export default function OwnerInquiriesScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useOwnerAuth();
  const { inquiries, isLoading } = useOwnerData();
  const [activeFilter, setActiveFilter] = useState<StageFilter>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/owner-portal');
    }
  }, [isAuthenticated, router]);

  const filteredInquiries = activeFilter === 'all'
    ? inquiries
    : inquiries.filter(i => i.stage === activeFilter);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={BrandColors.black} />
        </Pressable>
        <Text style={styles.headerTitle}>Inquiries</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
            All ({inquiries.length})
          </Text>
        </Pressable>
        {Object.entries(INQUIRY_STAGES).map(([key, config]) => {
          const count = inquiries.filter(i => i.stage === key).length;
          return (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                activeFilter === key && styles.filterChipActive,
                activeFilter === key && { backgroundColor: `${config.color}20` },
              ]}
              onPress={() => setActiveFilter(key as StageFilter)}
            >
              <View style={[styles.filterDot, { backgroundColor: config.color }]} />
              <Text style={[
                styles.filterText,
                activeFilter === key && styles.filterTextActive,
                activeFilter === key && { color: config.color },
              ]}>
                {config.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {filteredInquiries.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={BrandColors.gray.medium} />
              <Text style={styles.emptyText}>No inquiries in this stage</Text>
            </View>
          ) : (
            <View style={styles.inquiriesList}>
              {filteredInquiries.map((inquiry) => (
                <InquiryCard key={inquiry.id} inquiry={inquiry} isMobile={isMobile} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InquiryCard({ inquiry, isMobile }: { inquiry: OwnerInquiry; isMobile: boolean }) {
  const stageConfig = INQUIRY_STAGES[inquiry.stage];
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Pressable
      style={[styles.inquiryCard, isMobile && styles.inquiryCardMobile]}
      onPress={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <View style={styles.inquiryHeader}>
        <View style={styles.inquiryHeaderLeft}>
          <Text style={styles.guestName}>{inquiry.guestName}</Text>
          <Text style={styles.inquiryDate}>{formatDate(inquiry.date)}</Text>
        </View>
        <View style={[styles.stageBadge, { backgroundColor: `${stageConfig.color}20` }]}>
          <Text style={[styles.stageText, { color: stageConfig.color }]}>
            {stageConfig.label}
          </Text>
        </View>
      </View>

      {/* Property Info */}
      <View style={styles.propertyInfo}>
        <Feather name="home" size={14} color={BrandColors.gray.medium} />
        <Text style={styles.propertyName}>{inquiry.propertyName}</Text>
      </View>

      {/* Dates and Guests */}
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={14} color={BrandColors.gray.medium} />
          <Text style={styles.detailText}>
            {formatDate(inquiry.checkIn)} - {formatDate(inquiry.checkOut)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="users" size={14} color={BrandColors.gray.medium} />
          <Text style={styles.detailText}>{inquiry.guests} guests</Text>
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Contact Info */}
          <View style={styles.contactSection}>
            <Text style={styles.contactLabel}>Contact</Text>
            <View style={styles.contactItem}>
              <Feather name="mail" size={14} color={BrandColors.gray.medium} />
              <Text style={styles.contactText}>{inquiry.guestEmail}</Text>
            </View>
            <View style={styles.contactItem}>
              <Feather name="phone" size={14} color={BrandColors.gray.medium} />
              <Text style={styles.contactText}>{inquiry.guestPhone}</Text>
            </View>
          </View>

          {/* Message */}
          {inquiry.message && (
            <View style={styles.messageSection}>
              <Text style={styles.contactLabel}>Message</Text>
              <Text style={styles.messageText}>{inquiry.message}</Text>
            </View>
          )}

          {/* Notes */}
          {inquiry.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.contactLabel}>Notes</Text>
              <Text style={styles.notesText}>{inquiry.notes}</Text>
            </View>
          )}
        </View>
      )}

      {/* Expand Indicator */}
      <View style={styles.expandIndicator}>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={BrandColors.gray.medium}
        />
      </View>
    </Pressable>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  headerRight: {
    width: 44,
  },
  filterBar: {
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray.border,
  },
  filterContent: {
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
    gap: Space[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    borderRadius: Radius.full,
    backgroundColor: BrandColors.gray.light,
    marginRight: Space[2],
  },
  filterChipActive: {
    backgroundColor: BrandColors.black,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  filterTextActive: {
    color: BrandColors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Space[8],
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    padding: Space[4],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Space[16],
  },
  emptyText: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    color: BrandColors.gray.medium,
    marginTop: Space[4],
  },
  inquiriesList: {
    gap: Space[4],
  },
  inquiryCard: {
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    padding: Space[5],
    ...Shadow.base,
  },
  inquiryCardMobile: {
    padding: Space[4],
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Space[3],
  },
  inquiryHeaderLeft: {
    flex: 1,
  },
  guestName: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
  },
  inquiryDate: {
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
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
    marginBottom: Space[2],
  },
  propertyName: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[4],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  detailText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  expandedContent: {
    marginTop: Space[4],
    paddingTop: Space[4],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    gap: Space[4],
  },
  contactSection: {
    gap: Space[2],
  },
  contactLabel: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.gray.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Space[1],
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  contactText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.black,
  },
  messageSection: {
    gap: Space[1],
  },
  messageText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
    fontStyle: 'italic',
  },
  notesSection: {
    gap: Space[1],
    backgroundColor: BrandColors.gray.light,
    padding: Space[3],
    borderRadius: Radius.md,
  },
  notesText: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.dark,
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: Space[3],
  },
});
