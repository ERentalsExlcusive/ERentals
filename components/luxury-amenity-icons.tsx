import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BrandColors } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const STROKE = 1.8; // Monolinear stroke width

// WiFi - Concentric arcs
export function LuxuryWiFiIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Center dot */}
      <View style={{
        width: size * 0.12,
        height: size * 0.12,
        borderRadius: size * 0.06,
        backgroundColor: color,
        position: 'absolute',
        bottom: size * 0.2,
        alignSelf: 'center',
      }} />
      {/* Inner arc */}
      <View style={{
        width: size * 0.35,
        height: size * 0.175,
        borderWidth: STROKE,
        borderColor: color,
        borderTopLeftRadius: size * 0.35,
        borderTopRightRadius: size * 0.35,
        borderBottomWidth: 0,
        position: 'absolute',
        bottom: size * 0.32,
        alignSelf: 'center',
      }} />
      {/* Middle arc */}
      <View style={{
        width: size * 0.55,
        height: size * 0.275,
        borderWidth: STROKE,
        borderColor: color,
        borderTopLeftRadius: size * 0.55,
        borderTopRightRadius: size * 0.55,
        borderBottomWidth: 0,
        position: 'absolute',
        bottom: size * 0.35,
        alignSelf: 'center',
      }} />
      {/* Outer arc */}
      <View style={{
        width: size * 0.75,
        height: size * 0.375,
        borderWidth: STROKE,
        borderColor: color,
        borderTopLeftRadius: size * 0.75,
        borderTopRightRadius: size * 0.75,
        borderBottomWidth: 0,
        position: 'absolute',
        bottom: size * 0.38,
        alignSelf: 'center',
      }} />
    </View>
  );
}

// Pool - Minimalist waves
export function LuxuryPoolIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pool outline */}
      <View style={{
        width: size * 0.75,
        height: size * 0.6,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.2,
      }} />
      {/* Wave 1 */}
      <View style={{
        width: size * 0.5,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.4,
      }} />
      {/* Wave 2 */}
      <View style={{
        width: size * 0.4,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.55,
      }} />
    </View>
  );
}

// Air Conditioning - Clean lines
export function LuxuryACIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* AC unit */}
      <View style={{
        width: size * 0.7,
        height: size * 0.45,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.06,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.15,
      }} />
      {/* Vent line 1 */}
      <View style={{
        width: size * 0.15,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.2,
        bottom: size * 0.2,
      }} />
      {/* Vent line 2 */}
      <View style={{
        width: size * 0.15,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.425,
        bottom: size * 0.2,
      }} />
      {/* Vent line 3 */}
      <View style={{
        width: size * 0.15,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        right: size * 0.2,
        bottom: size * 0.2,
      }} />
    </View>
  );
}

// Parking - Simple P
export function LuxuryParkingIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* P vertical stem */}
      <View style={{
        width: STROKE,
        height: size * 0.6,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.25,
        top: size * 0.2,
      }} />
      {/* P arc - top */}
      <View style={{
        width: size * 0.3,
        height: size * 0.3,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.15,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        position: 'absolute',
        left: size * 0.25,
        top: size * 0.2,
      }} />
      {/* P arc - right */}
      <View style={{
        width: size * 0.3,
        height: size * 0.3,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.15,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        position: 'absolute',
        left: size * 0.25,
        top: size * 0.2,
      }} />
    </View>
  );
}

// Kitchen - Elegant utensils
export function LuxuryKitchenIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Fork - left */}
      <View style={{
        width: STROKE,
        height: size * 0.65,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.28,
        top: size * 0.18,
      }} />
      <View style={{
        width: STROKE,
        height: size * 0.35,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.22,
        top: size * 0.18,
      }} />
      <View style={{
        width: STROKE,
        height: size * 0.35,
        backgroundColor: color,
        position: 'absolute',
        left: size * 0.34,
        top: size * 0.18,
      }} />

      {/* Knife - right */}
      <View style={{
        width: STROKE,
        height: size * 0.65,
        backgroundColor: color,
        position: 'absolute',
        right: size * 0.28,
        top: size * 0.18,
      }} />
      {/* Knife blade */}
      <View style={{
        width: size * 0.06,
        height: size * 0.25,
        borderWidth: STROKE,
        borderColor: color,
        position: 'absolute',
        right: size * 0.25,
        top: size * 0.18,
      }} />
    </View>
  );
}

// Gym - Minimalist dumbbell
export function LuxuryGymIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Bar */}
      <View style={{
        width: size * 0.55,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.5,
      }} />
      {/* Left weight */}
      <View style={{
        width: size * 0.18,
        height: size * 0.35,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.04,
        position: 'absolute',
        left: size * 0.08,
        top: size * 0.325,
      }} />
      {/* Right weight */}
      <View style={{
        width: size * 0.18,
        height: size * 0.35,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.04,
        position: 'absolute',
        right: size * 0.08,
        top: size * 0.325,
      }} />
    </View>
  );
}

// Beach/Ocean - Wave
export function LuxuryBeachIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Umbrella arc */}
      <View style={{
        width: size * 0.65,
        height: size * 0.325,
        borderWidth: STROKE,
        borderColor: color,
        borderTopLeftRadius: size * 0.65,
        borderTopRightRadius: size * 0.65,
        borderBottomWidth: 0,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.2,
      }} />
      {/* Umbrella pole */}
      <View style={{
        width: STROKE,
        height: size * 0.5,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.2,
      }} />
    </View>
  );
}

// TV/Entertainment - Clean screen
export function LuxuryTVIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Screen */}
      <View style={{
        width: size * 0.7,
        height: size * 0.5,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.04,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.15,
      }} />
      {/* Stand vertical */}
      <View style={{
        width: STROKE,
        height: size * 0.12,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        bottom: size * 0.18,
      }} />
      {/* Stand base */}
      <View style={{
        width: size * 0.35,
        height: STROKE,
        backgroundColor: color,
        position: 'absolute',
        alignSelf: 'center',
        bottom: size * 0.18,
      }} />
    </View>
  );
}

// Pet Friendly - Minimal paw
export function LuxuryPetIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Main pad */}
      <View style={{
        width: size * 0.28,
        height: size * 0.32,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.14,
        position: 'absolute',
        alignSelf: 'center',
        bottom: size * 0.22,
      }} />
      {/* Top left toe */}
      <View style={{
        width: size * 0.14,
        height: size * 0.16,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        left: size * 0.22,
        top: size * 0.18,
      }} />
      {/* Top right toe */}
      <View style={{
        width: size * 0.14,
        height: size * 0.16,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        right: size * 0.22,
        top: size * 0.18,
      }} />
      {/* Middle left toe */}
      <View style={{
        width: size * 0.14,
        height: size * 0.16,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        left: size * 0.32,
        top: size * 0.28,
      }} />
      {/* Middle right toe */}
      <View style={{
        width: size * 0.14,
        height: size * 0.16,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.08,
        position: 'absolute',
        right: size * 0.32,
        top: size * 0.28,
      }} />
    </View>
  );
}

// Washer/Laundry - Modern machine
export function LuxuryWasherIcon({ size = 32, color = BrandColors.secondary }: IconProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Machine body */}
      <View style={{
        width: size * 0.65,
        height: size * 0.7,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.06,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.15,
      }} />
      {/* Door/window circle */}
      <View style={{
        width: size * 0.4,
        height: size * 0.4,
        borderWidth: STROKE,
        borderColor: color,
        borderRadius: size * 0.2,
        position: 'absolute',
        alignSelf: 'center',
        top: size * 0.35,
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
