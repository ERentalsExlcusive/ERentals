import { StyleSheet, View, Text, ScrollView, Pressable, Image, Platform, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BrandColors } from '@/constants/theme';
import { Space, FontSize, LineHeight, FontWeight, Radius, Shadow } from '@/constants/design-tokens';
import { useOwnerAuth } from '@/context/owner-auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { useOwnerData } from '@/hooks/use-owner-data';
import { OwnerAsset } from '@/data/mock-owner-data';

export default function OwnerAssetsScreen() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useOwnerAuth();
  const { assets, isLoading } = useOwnerData();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/owner-portal');
    }
  }, [isAuthenticated, router]);

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
        <Text style={styles.headerTitle}>My Assets</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.secondary} />
            </View>
          ) : assets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="home" size={48} color={BrandColors.gray.medium} />
              <Text style={styles.emptyText}>No assets yet</Text>
            </View>
          ) : (
            <View style={[styles.assetsGrid, isMobile && styles.assetsGridMobile]}>
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} isMobile={isMobile} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function AssetCard({ asset, isMobile }: { asset: OwnerAsset; isMobile: boolean }) {
  const statusColors = {
    active: '#22c55e',
    draft: '#eab308',
    unavailable: '#6b7280',
  };

  return (
    <View style={[styles.assetCard, isMobile && styles.assetCardMobile]}>
      {/* Image */}
      <Image
        source={{ uri: asset.imageUrl }}
        style={styles.assetImage}
        resizeMode="cover"
      />

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColors[asset.status] }]}>
        <Text style={styles.statusText}>
          {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.assetContent}>
        <Text style={styles.assetName}>{asset.name}</Text>
        <View style={styles.assetMeta}>
          <View style={styles.assetMetaItem}>
            <Feather name="map-pin" size={12} color={BrandColors.gray.medium} />
            <Text style={styles.assetLocation}>{asset.location}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{asset.category}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="eye" size={14} color={BrandColors.gray.dark} />
            <Text style={styles.statValue}>{asset.stats.views}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="message-square" size={14} color={BrandColors.gray.dark} />
            <Text style={styles.statValue}>{asset.stats.inquiries}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="calendar" size={14} color={BrandColors.gray.dark} />
            <Text style={styles.statValue}>{asset.stats.bookings}</Text>
          </View>
        </View>

        {/* Price */}
        <Text style={styles.assetPrice}>{asset.displayPrice}</Text>
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
  loadingContainer: {
    padding: Space[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: Space[12],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: Space[4],
    fontSize: FontSize.md,
    color: BrandColors.gray.medium,
  },
  assetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[6],
  },
  assetsGridMobile: {
    gap: Space[4],
  },
  assetCard: {
    width: Platform.select({ web: 'calc(33.333% - 16px)', default: '100%' }) as any,
    backgroundColor: BrandColors.white,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.base,
  },
  assetCardMobile: {
    width: '100%',
  },
  assetImage: {
    width: '100%',
    height: 180,
  },
  statusBadge: {
    position: 'absolute',
    top: Space[3],
    right: Space[3],
    paddingVertical: Space[1],
    paddingHorizontal: Space[2],
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.semibold,
    color: BrandColors.white,
  },
  assetContent: {
    padding: Space[4],
  },
  assetName: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,
    color: BrandColors.black,
    marginBottom: Space[2],
  },
  assetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[3],
  },
  assetMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  assetLocation: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    color: BrandColors.gray.medium,
  },
  categoryBadge: {
    backgroundColor: BrandColors.gray.light,
    paddingVertical: Space[1],
    paddingHorizontal: Space[2],
    borderRadius: Radius.sm,
  },
  categoryText: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Space[4],
    paddingVertical: Space[3],
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray.border,
    marginTop: Space[2],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  statValue: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,
    color: BrandColors.gray.dark,
  },
  assetPrice: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.semibold,
    color: BrandColors.secondary,
    marginTop: Space[2],
  },
});
