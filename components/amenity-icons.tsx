import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// WiFi Icon
export function WiFiIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Bottom dot */}
      <View
        style={{
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: size * 0.05,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.15,
          alignSelf: 'center',
        }}
      />
      {/* Small arc */}
      <View
        style={{
          width: size * 0.3,
          height: size * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopLeftRadius: size * 0.3,
          borderTopRightRadius: size * 0.3,
          borderBottomWidth: 0,
          position: 'absolute',
          bottom: size * 0.3,
          alignSelf: 'center',
        }}
      />
      {/* Medium arc */}
      <View
        style={{
          width: size * 0.5,
          height: size * 0.25,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopLeftRadius: size * 0.5,
          borderTopRightRadius: size * 0.5,
          borderBottomWidth: 0,
          position: 'absolute',
          bottom: size * 0.35,
          alignSelf: 'center',
        }}
      />
      {/* Large arc */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.35,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopLeftRadius: size * 0.7,
          borderTopRightRadius: size * 0.7,
          borderBottomWidth: 0,
          position: 'absolute',
          bottom: size * 0.4,
          alignSelf: 'center',
        }}
      />
    </View>
  );
}

// Pool Icon
export function PoolIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Pool rectangle */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.5,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.1,
          position: 'absolute',
          bottom: size * 0.15,
          left: size * 0.15,
        }}
      />
      {/* Wave lines */}
      <View
        style={{
          width: size * 0.4,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.35,
          left: size * 0.3,
        }}
      />
      <View
        style={{
          width: size * 0.3,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.45,
          left: size * 0.35,
        }}
      />
    </View>
  );
}

// AC Icon
export function ACIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* AC unit rectangle */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.4,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.2,
          alignSelf: 'center',
        }}
      />
      {/* Airflow lines */}
      <View
        style={{
          width: size * 0.15,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.15,
          left: size * 0.2,
        }}
      />
      <View
        style={{
          width: size * 0.15,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.15,
          left: size * 0.425,
        }}
      />
      <View
        style={{
          width: size * 0.15,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.15,
          right: size * 0.2,
        }}
      />
    </View>
  );
}

// Parking Icon
export function ParkingIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* P letter outline */}
      <View
        style={{
          width: size * 0.6,
          height: size * 0.6,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.1,
          position: 'absolute',
          alignSelf: 'center',
          top: size * 0.2,
        }}
      />
      {/* P stem */}
      <View
        style={{
          width: strokeWidth,
          height: size * 0.4,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.3,
          top: size * 0.3,
        }}
      />
      {/* P arc */}
      <View
        style={{
          width: size * 0.2,
          height: size * 0.2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.1,
          borderLeftWidth: 0,
          position: 'absolute',
          left: size * 0.3,
          top: size * 0.3,
        }}
      />
    </View>
  );
}

// Kitchen Icon
export function KitchenIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Utensils */}
      {/* Fork */}
      <View
        style={{
          width: strokeWidth,
          height: size * 0.6,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.3,
          top: size * 0.2,
        }}
      />
      <View
        style={{
          width: strokeWidth,
          height: size * 0.3,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.25,
          top: size * 0.2,
        }}
      />
      <View
        style={{
          width: strokeWidth,
          height: size * 0.3,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.35,
          top: size * 0.2,
        }}
      />
      {/* Spoon */}
      <View
        style={{
          width: strokeWidth,
          height: size * 0.6,
          backgroundColor: color,
          position: 'absolute',
          right: size * 0.3,
          top: size * 0.2,
        }}
      />
      <View
        style={{
          width: size * 0.08,
          height: size * 0.12,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.04,
          position: 'absolute',
          right: size * 0.26,
          top: size * 0.2,
        }}
      />
    </View>
  );
}

// Gym Icon
export function GymIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Dumbbell */}
      {/* Left weight */}
      <View
        style={{
          width: size * 0.15,
          height: size * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.05,
          position: 'absolute',
          left: size * 0.1,
          top: size * 0.35,
        }}
      />
      {/* Bar */}
      <View
        style={{
          width: size * 0.5,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.25,
          top: size * 0.5,
        }}
      />
      {/* Right weight */}
      <View
        style={{
          width: size * 0.15,
          height: size * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.05,
          position: 'absolute',
          right: size * 0.1,
          top: size * 0.35,
        }}
      />
    </View>
  );
}

// Beach Icon
export function BeachIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Umbrella arc */}
      <View
        style={{
          width: size * 0.6,
          height: size * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopLeftRadius: size * 0.6,
          borderTopRightRadius: size * 0.6,
          borderBottomWidth: 0,
          position: 'absolute',
          top: size * 0.25,
          left: size * 0.2,
        }}
      />
      {/* Pole */}
      <View
        style={{
          width: strokeWidth,
          height: size * 0.5,
          backgroundColor: color,
          position: 'absolute',
          left: size * 0.5,
          top: size * 0.25,
        }}
      />
    </View>
  );
}

// TV Icon
export function TVIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Screen */}
      <View
        style={{
          width: size * 0.7,
          height: size * 0.5,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.05,
          position: 'absolute',
          top: size * 0.15,
          alignSelf: 'center',
        }}
      />
      {/* Stand */}
      <View
        style={{
          width: size * 0.3,
          height: strokeWidth,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.2,
          alignSelf: 'center',
        }}
      />
      <View
        style={{
          width: strokeWidth,
          height: size * 0.1,
          backgroundColor: color,
          position: 'absolute',
          bottom: size * 0.2,
          alignSelf: 'center',
        }}
      />
    </View>
  );
}

// Pet Friendly Icon
export function PetIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Paw print */}
      {/* Main pad */}
      <View
        style={{
          width: size * 0.25,
          height: size * 0.3,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.15,
          position: 'absolute',
          bottom: size * 0.25,
          alignSelf: 'center',
        }}
      />
      {/* Top left toe */}
      <View
        style={{
          width: size * 0.12,
          height: size * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.2,
          left: size * 0.25,
        }}
      />
      {/* Top right toe */}
      <View
        style={{
          width: size * 0.12,
          height: size * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.2,
          right: size * 0.25,
        }}
      />
      {/* Middle left toe */}
      <View
        style={{
          width: size * 0.12,
          height: size * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.3,
          left: size * 0.35,
        }}
      />
      {/* Middle right toe */}
      <View
        style={{
          width: size * 0.12,
          height: size * 0.15,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.3,
          right: size * 0.35,
        }}
      />
    </View>
  );
}

// Washer/Dryer Icon
export function WasherIcon({ size = 24, color = BrandColors.secondary, strokeWidth = 1.2 }: IconProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Machine body */}
      <View
        style={{
          width: size * 0.6,
          height: size * 0.7,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.08,
          position: 'absolute',
          top: size * 0.15,
          alignSelf: 'center',
        }}
      />
      {/* Door circle */}
      <View
        style={{
          width: size * 0.35,
          height: size * 0.35,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRadius: size * 0.175,
          position: 'absolute',
          top: size * 0.35,
          alignSelf: 'center',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
