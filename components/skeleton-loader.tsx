import { View, StyleSheet, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { BrandColors, Spacing } from '@/constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = '100%',
  height = 200,
  borderRadius = 8,
  style
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Image skeleton */}
      <SkeletonLoader
        width="100%"
        height={300}
        borderRadius={12}
        style={styles.imageSkeleton}
      />

      {/* Info skeleton */}
      <View style={styles.info}>
        {/* Title */}
        <SkeletonLoader
          width="80%"
          height={20}
          borderRadius={4}
          style={styles.titleSkeleton}
        />

        {/* Location */}
        <SkeletonLoader
          width="60%"
          height={16}
          borderRadius={4}
          style={styles.locationSkeleton}
        />

        {/* Details row */}
        <View style={styles.detailsRow}>
          <SkeletonLoader width={70} height={16} borderRadius={4} />
          <SkeletonLoader width={70} height={16} borderRadius={4} />
          <SkeletonLoader width={70} height={16} borderRadius={4} />
        </View>

        {/* Price */}
        <SkeletonLoader
          width="50%"
          height={18}
          borderRadius={4}
          style={styles.priceSkeleton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: BrandColors.gray.light,
    ...Platform.select({
      web: {
        // CSS animation as fallback for web
        animation: 'pulse 1.5s ease-in-out infinite',
      },
    }),
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  imageSkeleton: {
    aspectRatio: 1,
  },
  info: {
    paddingTop: Spacing.sm,
    paddingHorizontal: 0,
  },
  titleSkeleton: {
    marginBottom: Spacing.xs,
  },
  locationSkeleton: {
    marginBottom: Spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  priceSkeleton: {
    marginTop: Spacing.xs,
  },
});
