/**
 * Responsive design hooks for mobile, tablet, and desktop breakpoints
 */

import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

export function useResponsive() {
  const { width } = useWindowDimensions();

  return {
    width,
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet,
    breakpoint: width < BREAKPOINTS.mobile
      ? 'mobile'
      : width < BREAKPOINTS.tablet
      ? 'tablet'
      : 'desktop',
  };
}
