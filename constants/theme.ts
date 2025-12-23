/**
 * ERentals Exclusive Brand Theme
 * Colors and typography based on erentalsexclusive.com
 */

import { Platform } from 'react-native';

// Brand Colors
export const BrandColors = {
  primary: '#1f2839',      // Dark navy
  secondary: '#bc944d',    // Gold accent
  white: '#ffffff',
  black: '#000000',
  gray: {
    light: '#f5f4f4',
    medium: '#818181',
    dark: '#505050',
    darker: '#232323',
  },
};

export const Colors = {
  light: {
    text: BrandColors.black,
    textSecondary: BrandColors.gray.dark,
    background: BrandColors.white,
    backgroundSecondary: BrandColors.gray.light,
    tint: BrandColors.secondary,
    primary: BrandColors.primary,
    accent: BrandColors.secondary,
    icon: BrandColors.gray.medium,
    tabIconDefault: BrandColors.gray.medium,
    tabIconSelected: BrandColors.secondary,
  },
  dark: {
    text: BrandColors.white,
    textSecondary: BrandColors.gray.medium,
    background: BrandColors.primary,
    backgroundSecondary: BrandColors.gray.darker,
    tint: BrandColors.secondary,
    primary: BrandColors.primary,
    accent: BrandColors.secondary,
    icon: BrandColors.gray.medium,
    tabIconDefault: BrandColors.gray.medium,
    tabIconSelected: BrandColors.secondary,
  },
};

// Typography sizes (matching website)
export const Typography = {
  h1: {
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
  },
  h2: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
  },
  h3: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  body: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

// Button styles
export const ButtonStyles = {
  primary: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  primaryPressed: {
    backgroundColor: BrandColors.primary,
  },
};

// Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 64,
};

export const Fonts = Platform.select({
  ios: {
    serif: 'Georgia',
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    serif: 'serif',
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    serif: "'Cormorant Garamond', 'DM Serif Display', Georgia, serif",
    sans: "'Optima', 'Titillium Web', system-ui, sans-serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, monospace",
  },
});
