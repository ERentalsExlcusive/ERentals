import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

// Grouped Avatars Icon for Creators
export function GroupedAvatarsIcon({ size = 22, color = BrandColors.black, focused = false }: IconProps) {
  const strokeWidth = focused ? 1.5 : 1.2;
  const circleSize = size * 0.35;
  const spacing = size * 0.25;

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Left avatar */}
      <View
        style={[
          styles.avatar,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            left: 0,
            top: size * 0.15,
          },
        ]}
      />
      {/* Center avatar (slightly overlapping) */}
      <View
        style={[
          styles.avatar,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            left: spacing,
            top: size * 0.05,
            backgroundColor: BrandColors.white,
          },
        ]}
      />
      {/* Right avatar */}
      <View
        style={[
          styles.avatar,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            left: spacing * 2,
            top: size * 0.15,
            backgroundColor: BrandColors.white,
          },
        ]}
      />
    </View>
  );
}

// Minimal Phone Icon
export function PhoneIcon({ size = 22, color = BrandColors.black, focused = false }: IconProps) {
  const strokeWidth = focused ? 1.5 : 1.2;
  const phoneWidth = size * 0.5;
  const phoneHeight = size * 0.75;

  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.phoneBody,
          {
            width: phoneWidth,
            height: phoneHeight,
            borderRadius: size * 0.12,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            left: (size - phoneWidth) / 2,
            top: (size - phoneHeight) / 2,
          },
        ]}
      >
        {/* Small circle at bottom for home button */}
        <View
          style={{
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: size * 0.04,
            borderWidth: strokeWidth,
            borderColor: color,
            position: 'absolute',
            bottom: size * 0.05,
            alignSelf: 'center',
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
  phoneBody: {
    backgroundColor: 'transparent',
  },
});
