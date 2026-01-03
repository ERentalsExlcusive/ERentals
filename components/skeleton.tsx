import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useEffect, useRef } from 'react';
import { BrandColors } from '@/constants/theme';
import { Space, Radius } from '@/constants/design-tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = Radius.base, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function PropertyPageSkeleton() {
  return (
    <View style={styles.container}>
      {/* Gallery Skeleton */}
      <Skeleton width="100%" height={Platform.select({ web: 600, default: 400 })} borderRadius={0} />

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.section}>
          <Skeleton width={120} height={12} style={{ marginBottom: Space[2] }} />
          <Skeleton width="80%" height={44} style={{ marginBottom: Space[3] }} />
          <Skeleton width="60%" height={44} style={{ marginBottom: Space[4] }} />
          <Skeleton width={200} height={16} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Skeleton width={140} height={20} style={{ marginBottom: Space[4] }} />
          <Skeleton width="100%" height={16} style={{ marginBottom: Space[2] }} />
          <Skeleton width="95%" height={16} style={{ marginBottom: Space[2] }} />
          <Skeleton width="88%" height={16} style={{ marginBottom: Space[2] }} />
          <Skeleton width="92%" height={16} />
        </View>

        {/* Amenities Grid */}
        <View style={styles.section}>
          <Skeleton width={120} height={20} style={{ marginBottom: Space[4] }} />
          <View style={styles.amenitiesGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                width={Platform.select({ web: 'calc(33.333% - 11px)', default: 'calc(50% - 8px)' }) as any}
                height={44}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: BrandColors.gray.light,
  },
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
  },
  content: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Space[6],
    paddingTop: Space[8],
  },
  section: {
    marginBottom: Space[12],
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[4],
  },
});
