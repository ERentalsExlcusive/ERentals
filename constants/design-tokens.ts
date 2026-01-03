/**
 * Design Tokens - ERentals Exclusive
 * 8pt grid system, consistent spacing, typography, and visual rhythm
 */

// 8pt Grid System - All spacing uses multiples of 8
export const Space = {
  0: 0,
  1: 4,    // 0.5 unit
  2: 8,    // 1 unit (base)
  3: 12,   // 1.5 units
  4: 16,   // 2 units
  5: 20,   // 2.5 units
  6: 24,   // 3 units
  8: 32,   // 4 units
  10: 40,  // 5 units
  12: 48,  // 6 units
  14: 56,  // 7 units
  16: 64,  // 8 units
  20: 80,  // 10 units
  24: 96,  // 12 units
} as const;

// Typography Scale
export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 44,
} as const;

export const LineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 44,
  '6xl': 52,
} as const;

export const FontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const LetterSpacing = {
  tighter: -1.2,
  tight: -0.8,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
  widest: 1.5,
} as const;

// Border Radius
export const Radius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Shadows
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Z-Index Scale
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
} as const;

// Touch Targets
export const TouchTarget = {
  min: 44,
  comfortable: 48,
  spacious: 56,
} as const;

// Container Widths
export const Container = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,

  // Content-specific
  content: 720,    // Editorial content width
  listing: 1200,   // Property listing max width
} as const;

// Section Spacing (responsive)
export const SectionSpacing = {
  mobile: Space[14],      // 56px
  tablet: Space[20],      // 80px
  desktop: Space[24],     // 96px
} as const;
