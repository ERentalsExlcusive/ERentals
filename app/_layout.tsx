import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSerifDisplay_400Regular,
} from '@expo-google-fonts/dm-serif-display';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  // Custom theme with brand colors
  const LightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: BrandColors.secondary,
      background: BrandColors.white,
      card: BrandColors.white,
      text: BrandColors.black,
    },
  };

  const DarkBrandTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: BrandColors.secondary,
      background: BrandColors.primary,
      card: BrandColors.primary,
      text: BrandColors.white,
    },
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkBrandTheme : LightTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
