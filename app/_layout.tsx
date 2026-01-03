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
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandColors } from '@/constants/theme';
import { SearchProvider } from '@/context/search-context';
import { AuthProvider } from '@/context/auth-context';
import { FavoritesProvider } from '@/context/favorites-context';

// Inject global CSS for web focus states (guard against multiple injections)
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('erentals-focus-styles')) {
  const style = document.createElement('style');
  style.id = 'erentals-focus-styles';
  style.textContent = `
    /* Gold focus rings instead of browser default blue */
    *:focus {
      outline: none;
    }
    *:focus-visible {
      outline: 2px solid ${BrandColors.secondary};
      outline-offset: 2px;
    }
    /* Specific input focus styles */
    input:focus, textarea:focus, select:focus, button:focus-visible {
      outline: 2px solid ${BrandColors.secondary};
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(188, 148, 77, 0.15);
    }
    /* Remove default tap highlight on mobile */
    * {
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
}

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
    <AuthProvider>
      <FavoritesProvider>
        <SearchProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkBrandTheme : LightTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="property/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="collaborate" options={{ headerShown: false }} />
              <Stack.Screen name="blog" options={{ headerShown: false }} />
              <Stack.Screen name="about" options={{ headerShown: false }} />
              <Stack.Screen name="owner-portal" options={{ headerShown: false }} />
              <Stack.Screen name="favorites" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="light" translucent backgroundColor="transparent" />
          </ThemeProvider>
        </SearchProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}
